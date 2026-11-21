"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  submitContribution,
  type SubmitActionResult,
} from "@/lib/submissions/submit-action";
import { prepareUpload } from "@/lib/submissions/upload-action";
import { GPX_MIME_TYPE, SUBMISSION_TYPES } from "@/lib/submissions/schema";
import { trackEvent } from "@/lib/analytics/track";

const initialState: SubmitActionResult = { status: "error" };

const inputClasses =
  "border-bone/20 text-bone placeholder:text-bone/40 focus-visible:outline-blood w-full rounded-md border px-4 py-2.5 text-base focus-visible:outline-2 focus-visible:outline-offset-2";
const labelClasses = "text-bone text-sm font-medium";

const TEXT_FIELD_NAMES = [
  "contributorName",
  "contributorEmail",
  "contributorUrl",
  "submissionType",
  "proposedTitle",
  "story",
  "location",
  "gearManufacturer",
  "gearModel",
  "gearSettings",
  "photographerCredit",
  "website",
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-blood mt-1 text-sm" role="alert">
      {message}
    </p>
  );
}

export function SubmissionForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: SubmitActionResult, formData: FormData) =>
      submitContribution(formData),
    initialState,
  );
  const [preSubmitError, setPreSubmitError] =
    useState<SubmitActionResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const errorSummaryId = useId();

  // Analytics latches: fire "begin" once on first field focus, and "complete"
  // once when the server action confirms success.
  const beganRef = useRef(false);
  const completedRef = useRef(false);
  const submissionTypeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.status === "success" && !completedRef.current) {
      completedRef.current = true;
      trackEvent("submission_complete", {
        submission_type: submissionTypeRef.current,
      });
    }
  }, [state.status]);

  function handleFirstFocus() {
    if (beganRef.current) return;
    beganRef.current = true;
    trackEvent("submission_begin");
  }

  const effectiveState = preSubmitError ?? state;
  const busy = isUploading || isPending;

  if (effectiveState.status === "success") {
    return (
      <div
        role="status"
        className="border-bone/10 rounded-md border p-6 text-center"
      >
        <p className="text-bone text-lg font-medium">Thanks — we got it.</p>
        <p className="text-bone/70 mt-2 text-sm">
          Someone will take a look. Submitting doesn&rsquo;t guarantee
          publication, and this doesn&rsquo;t mean your story is live yet.
        </p>
      </div>
    );
  }

  const fieldErrors = effectiveState.fieldErrors ?? {};
  const hasErrors =
    Object.keys(fieldErrors).length > 0 || Boolean(effectiveState.formError);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreSubmitError(null);

    const rawFormData = new FormData(event.currentTarget);
    const submissionType = rawFormData.get("submissionType");
    submissionTypeRef.current =
      typeof submissionType === "string" ? submissionType : undefined;
    const files = rawFormData
      .getAll("photos")
      .filter((f): f is File => f instanceof File && f.size > 0);
    const gpxField = rawFormData.get("gpxFile");
    const gpxFile =
      gpxField instanceof File && gpxField.size > 0 ? gpxField : null;

    setIsUploading(true);
    try {
      const declaredFiles = files.map((file) => ({
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }));
      const declaredGpxFile = gpxFile
        ? { originalFilename: gpxFile.name, sizeBytes: gpxFile.size }
        : undefined;

      const prep = await prepareUpload(declaredFiles, declaredGpxFile);
      if (prep.status === "error") {
        setPreSubmitError({ status: "error", fieldErrors: prep.fieldErrors });
        return;
      }

      const uploads = prep.uploads ?? [];
      const uploadResults = await Promise.all(
        uploads.map(async (target, index) => {
          const file = files[index];
          const response = await fetch(target.uploadUrl, {
            method: target.method,
            headers: target.headers,
            body: file,
          });
          if (!response.ok) {
            throw new Error(`Upload failed for "${file.name}".`);
          }
          return {
            objectKey: target.objectKey,
            mimeType: target.mimeType,
            sizeBytes: file.size,
            originalFilename: file.name,
          };
        }),
      );

      let gpxUploadResult: object | null = null;
      if (gpxFile && prep.gpxUpload) {
        const target = prep.gpxUpload;
        try {
          const response = await fetch(target.uploadUrl, {
            method: target.method,
            headers: target.headers,
            body: gpxFile,
          });
          if (!response.ok) {
            throw new Error(`Upload failed for "${gpxFile.name}".`);
          }
          gpxUploadResult = {
            objectKey: target.objectKey,
            mimeType: GPX_MIME_TYPE,
            sizeBytes: gpxFile.size,
            originalFilename: gpxFile.name,
          };
        } catch {
          setPreSubmitError({
            status: "error",
            fieldErrors: {
              gpxFile: "Uploading your GPX file failed. Please try again.",
            },
          });
          return;
        }
      }

      const finalFormData = new FormData();
      for (const name of TEXT_FIELD_NAMES) {
        finalFormData.set(name, rawFormData.get(name) ?? "");
      }
      finalFormData.set(
        "rightsConfirmed",
        rawFormData.get("rightsConfirmed") ?? "",
      );
      finalFormData.set(
        "editingPermission",
        rawFormData.get("editingPermission") ?? "",
      );
      finalFormData.set("submissionId", prep.submissionId ?? "");
      finalFormData.set("uploadedMedia", JSON.stringify(uploadResults));
      finalFormData.set(
        "uploadedGpx",
        gpxUploadResult ? JSON.stringify(gpxUploadResult) : "",
      );

      startTransition(() => {
        formAction(finalFormData);
      });
    } catch {
      setPreSubmitError({
        status: "error",
        fieldErrors: {
          photos: "Uploading your photos failed. Please try again.",
        },
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={handleFirstFocus}
      className="flex flex-col gap-6"
      noValidate
    >
      {hasErrors ? (
        <div
          id={errorSummaryId}
          role="alert"
          className="border-blood bg-blood/5 rounded-md border p-4 text-sm"
        >
          <p className="text-bone font-medium">
            {effectiveState.formError ??
              "Please fix the following before submitting:"}
          </p>
          {Object.keys(fieldErrors).length > 0 ? (
            <ul className="mt-2 list-inside list-disc">
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field} className="text-bone/80">
                  {message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Honeypot — hidden from sighted users, real browsers leave it
          empty; bots that autofill every field will trip validation. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contributorName" className={labelClasses}>
          Your name
        </label>
        <input
          id="contributorName"
          name="contributorName"
          type="text"
          required
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors.contributorName)}
        />
        <FieldError message={fieldErrors.contributorName} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contributorEmail" className={labelClasses}>
          Your email
        </label>
        <input
          id="contributorEmail"
          name="contributorEmail"
          type="email"
          required
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors.contributorEmail)}
        />
        <FieldError message={fieldErrors.contributorEmail} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contributorUrl" className={labelClasses}>
          Your website or social profile (optional)
        </label>
        <input
          id="contributorUrl"
          name="contributorUrl"
          type="url"
          className={inputClasses}
        />
        <FieldError message={fieldErrors.contributorUrl} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="submissionType" className={labelClasses}>
          What is this?
        </label>
        <select
          id="submissionType"
          name="submissionType"
          required
          defaultValue="relic"
          className={inputClasses}
        >
          {SUBMISSION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace("-", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="proposedTitle" className={labelClasses}>
          Proposed title (optional)
        </label>
        <input
          id="proposedTitle"
          name="proposedTitle"
          type="text"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="story" className={labelClasses}>
          Tell us about it
        </label>
        <textarea
          id="story"
          name="story"
          required
          rows={6}
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors.story)}
        />
        <FieldError message={fieldErrors.story} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="location" className={labelClasses}>
          Location (optional)
        </label>
        <input
          id="location"
          name="location"
          type="text"
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="gearManufacturer" className={labelClasses}>
            Gear manufacturer (optional)
          </label>
          <input
            id="gearManufacturer"
            name="gearManufacturer"
            type="text"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="gearModel" className={labelClasses}>
            Gear model (optional)
          </label>
          <input
            id="gearModel"
            name="gearModel"
            type="text"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="gearSettings" className={labelClasses}>
          Settings (optional)
        </label>
        <input
          id="gearSettings"
          name="gearSettings"
          type="text"
          placeholder="gain 2 o'clock, tone 5"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="photographerCredit" className={labelClasses}>
          Photographer credit (optional)
        </label>
        <input
          id="photographerCredit"
          name="photographerCredit"
          type="text"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="photos" className={labelClasses}>
          Photos (JPEG, PNG, or WebP — up to 6 files)
        </label>
        <input
          id="photos"
          name="photos"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className={inputClasses}
          aria-invalid={Boolean(fieldErrors.photos)}
        />
        <FieldError message={fieldErrors.photos} />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="rightsConfirmed"
          name="rightsConfirmed"
          type="checkbox"
          required
          className="mt-1 h-5 w-5 shrink-0"
          aria-invalid={Boolean(fieldErrors.rightsConfirmed)}
        />
        <label htmlFor="rightsConfirmed" className="text-bone/80 text-sm">
          I confirm I have the right to share these photos and this story.
        </label>
      </div>
      <FieldError message={fieldErrors.rightsConfirmed} />

      <div className="flex items-start gap-3">
        <input
          id="editingPermission"
          name="editingPermission"
          type="checkbox"
          required
          className="mt-1 h-5 w-5 shrink-0"
          aria-invalid={Boolean(fieldErrors.editingPermission)}
        />
        <label htmlFor="editingPermission" className="text-bone/80 text-sm">
          I understand this may be edited for clarity and presentation, and that
          submitting doesn&rsquo;t guarantee publication.
        </label>
      </div>
      <FieldError message={fieldErrors.editingPermission} />

      <button
        type="submit"
        disabled={busy}
        className="border-bone/20 text-bone hover:bg-bone/5 min-h-11 rounded-md border px-6 py-3 text-sm font-medium transition-colors disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
