declare module "pdfjs-dist/legacy/build/pdf" {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    destroy?(): void;
  }

  export interface PDFPageViewport {
    width: number;
    height: number;
    transform: number[];
    scale: number;
  }

  export interface PDFPageProxy {
    getViewport(options: { scale: number }): PDFPageViewport;
    render(params: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFPageViewport;
    }): RenderTask;
  }

  export interface RenderTask {
    promise: Promise<void>;
    cancel(): void;
  }

  export function getDocument(src: string | { url: string }): {
    promise: Promise<PDFDocumentProxy>;
    destroy?: () => void;
  };

  export const GlobalWorkerOptions: { workerSrc: string };

  const pdfjs: {
    getDocument: typeof getDocument;
    GlobalWorkerOptions: typeof GlobalWorkerOptions;
  };

  export default pdfjs;
}

declare module "pdfjs-dist" {
  const pdfjs: any;
  export = pdfjs;
}
