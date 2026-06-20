import PlotlyModule from "plotly.js-dist-min";

const resolveDefaultExport = <T,>(module: T | { default: T }): T =>
    "default" in Object(module) ? (module as { default: T }).default : (module as T);

const Plotly = resolveDefaultExport(PlotlyModule);

const textEncoder = new TextEncoder();

const dataUrlToBytes = async (dataUrl: string) => {
    const response = await fetch(dataUrl);
    return new Uint8Array(await response.arrayBuffer());
};

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });

const sanitizeFileName = (value: string) => {
    return (
        value
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9-_]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase() || "grafico"
    );
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
};

const concatChunks = (chunks: Uint8Array[], totalLength: number) => {
    const output = new Uint8Array(totalLength);
    let offset = 0;

    chunks.forEach((chunk) => {
        output.set(chunk, offset);
        offset += chunk.length;
    });

    return output;
};

const createSingleImagePDF = (
    imageBytes: Uint8Array,
    imageWidth: number,
    imageHeight: number,
) => {
    const isLandscape = imageWidth >= imageHeight;
    const pageWidth = isLandscape ? 841.89 : 595.28;
    const pageHeight = isLandscape ? 595.28 : 841.89;
    const margin = 36;
    const maxImageWidth = pageWidth - margin * 2;
    const maxImageHeight = pageHeight - margin * 2;
    const imageScale = Math.min(
        maxImageWidth / imageWidth,
        maxImageHeight / imageHeight,
    );
    const renderedWidth = imageWidth * imageScale;
    const renderedHeight = imageHeight * imageScale;
    const imageX = (pageWidth - renderedWidth) / 2;
    const imageY = (pageHeight - renderedHeight) / 2;
    const content = `q\n${renderedWidth.toFixed(2)} 0 0 ${renderedHeight.toFixed(2)} ${imageX.toFixed(2)} ${imageY.toFixed(2)} cm\n/ChartImage Do\nQ\n`;
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let totalLength = 0;

    const addBytes = (bytes: Uint8Array) => {
        chunks.push(bytes);
        totalLength += bytes.length;
    };
    const addText = (text: string) => addBytes(textEncoder.encode(text));
    const startObject = (id: number) => {
        offsets[id] = totalLength;
        addText(`${id} 0 obj\n`);
    };

    addText("%PDF-1.4\n");

    startObject(1);
    addText("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    startObject(2);
    addText("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

    startObject(3);
    addText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /ChartImage 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);

    startObject(4);
    addText(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);
    addBytes(imageBytes);
    addText("\nendstream\nendobj\n");

    startObject(5);
    addText(`<< /Length ${textEncoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

    const xrefOffset = totalLength;

    addText("xref\n0 6\n0000000000 65535 f \n");

    for (let id = 1; id <= 5; id += 1) {
        addText(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
    }

    addText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    return new Blob([concatChunks(chunks, totalLength)], {
        type: "application/pdf",
    });
};

export const exportPlotlyChartAsPDF = async (
    chartElement: HTMLElement,
    chartTitle: string,
    width: number,
    height: number,
) => {
    const imageDataUrl = await Plotly.toImage(chartElement, {
        format: "jpeg",
        height,
        scale: 2,
        width,
    });
    const image = await loadImage(imageDataUrl);
    const imageBytes = await dataUrlToBytes(imageDataUrl);
    const pdfBlob = createSingleImagePDF(
        imageBytes,
        image.naturalWidth,
        image.naturalHeight,
    );

    downloadBlob(pdfBlob, `${sanitizeFileName(chartTitle)}.pdf`);
};
