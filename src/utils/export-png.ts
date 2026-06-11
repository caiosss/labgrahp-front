import html2canvas from "html2canvas";

export async function exportElementAsPNG(
    element: HTMLElement,
    fileName = 'tabela-abnt.png'
) {
    const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  const image = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = image;
  link.download = fileName;
  link.click();
}