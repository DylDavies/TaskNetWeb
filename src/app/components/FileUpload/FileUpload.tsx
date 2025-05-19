import { Upload } from "lucide-react";
import toast from "react-hot-toast";
import { ChangeEvent } from "react";

type UploadFunction = (
  file: File,
  path: string,
  name: string,
  onProgress?: (progress: number) => void
) => Promise<string>;

type UploadComponentProps = {
  uploadFunction: UploadFunction;
  path: string;
  name: string;
  onUploadComplete?: (url: string, file: File) => void;
  fileType?: string; // Changed to lowercase to match convention
};

//This funciton will upload a file to the firebase bucket
function UploadComponent({ 
  uploadFunction, 
  path, 
  name, 
  onUploadComplete, 
  fileType 
}: UploadComponentProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // Validate file type first
    if(fileType){
    if (!file.type.includes(fileType.toLowerCase())) {
      toast.error(`Only ${fileType} files are allowed`);
      return;
    }
    }

    // Then validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    const toastId = toast.loading("Uploading File...");

    //This will upload the file
    uploadFunction(file, path, name)
      .then((url) => {
        toast.dismiss(toastId);
        toast.success("Upload complete!");
        onUploadComplete?.(url, file);
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        toast.dismiss(toastId);
        toast.error("Upload failed. Please try again.");
      });
  };

  return (
    <section>
      <label className="cursor-pointer flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700">
        <Upload className="w-5 h-5" />
        Upload
        <input
          type="file"
          accept={fileType} // Dynamically set accepted file type
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </section>
  );
}

export default UploadComponent;