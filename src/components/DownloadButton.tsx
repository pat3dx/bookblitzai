import React from 'react';

interface DownloadButtonProps {
  fullEbookContent: string;
  title: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ fullEbookContent, title }) => {
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([fullEbookContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Download eBook
    </button>
  );
};

export default DownloadButton;

