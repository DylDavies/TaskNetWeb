import { Upload } from "lucide-react";
import toast from "react-hot-toast";
//props for upload funciton
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
  onUploadComplete?: (url: string) => void;
};

function UploadComponent({ uploadFunction, path, name, onUploadComplete  }: UploadComponentProps) {
  //const [progress, setProgress] = useState<number>(0);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

     // setProgress(0);
      // Show uploading toast
      const toastId = toast.loading("Uploading File...");

      uploadFunction(file, path, name)
        .then((url) => {
          toast.dismiss(toastId);
          toast.success("Upload complete!");

          if (onUploadComplete) {
            onUploadComplete(url);
          }
          
        })
        .catch((error) => {
          console.error("Upload failed:", error);
          toast.dismiss(toastId);
          toast.error("Upload failed. Please try again.");
        });
    }
  };

  return (
    <section>
      <label className="cursor-pointer flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700">
        <Upload className="w-5 h-5" />
        Upload
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/*uploading && (
        <section className="w-full">
          <Progress value={progress} />
          <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}%</p>
        </section>
      )*/}

      {/*downloadURL && (
        <section className="text-center mt-2">
          <p className="text-green-600 text-sm">Upload complete!</p>
          <a
            href={downloadURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            View uploaded file
          </a>
        </section>
      )*/}
    </section>
  );
}

export default UploadComponent;
