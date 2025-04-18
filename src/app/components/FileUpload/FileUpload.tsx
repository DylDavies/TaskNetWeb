import { Progress } from "@material-tailwind/react";
import { Upload } from "lucide-react";
import { useState } from "react";


type UploadFunction = (
    file: File,
    path: string,
    name: string,
    onProgress?: (progress: number) => void
  ) => Promise<string>;
  
  type UploadComponentProps = {
    uploadFunction: UploadFunction;
    path: string;
  };
  
  function UploadComponent({ uploadFunction, path}: UploadComponentProps) {
    const [progress, setProgress] = useState<number>(0);
    const [downloadURL, setDownloadURL] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setUploading(true);
  
        uploadFunction(file, path, "test3", (prog) => {
          setProgress(prog);
        })
          .then((url) => {
            setDownloadURL(url);
            setUploading(false);
          })
          .catch((error) => {
            console.error("Upload failed:", error);
            setUploading(false);
          });
      }
    };
  
    return (
      <section className="p-4 border rounded-lg w-80 flex flex-col items-center gap-4">
        <label className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
          <Upload className="w-5 h-5" />
          Upload CV
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
  
        {uploading && (
          <section className="w-full">
            <Progress value={progress} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
            <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}%</p>
          </section>
        )}
  
        {downloadURL && (
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
        )}
      </section>
    );
  }
  
  export default UploadComponent;
