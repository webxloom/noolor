"use client";
import { ChevronLeft, ChevronRight, ZoomOut, ZoomIn } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

type Props = {
  contentUrl?: string;
  previewPages?: number | "all";
  onPageChange?: (page: number, numPages: number) => void;
  bookmarkedPage?: number | null; // optional bookmarked page number
};

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const getLastLeft = (numPages: number) =>
  numPages % 2 === 1 ? numPages : Math.max(1, numPages - 1);

const BookReadingPanel: React.FC<Props> = ({
  contentUrl,
  previewPages = 10,
  onPageChange,
  bookmarkedPage = null,
}) => {
  const canvasLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRightRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(bookmarkedPage || 1); // left page (odd)
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("bookmarkedPage", bookmarkedPage, "currentPage", currentPage);

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTasksRef = useRef<Array<pdfjsLib.RenderTask>>([]);

  const previewLimit = previewPages === "all" ? Infinity : Number(previewPages);

  // per-page viewability
  const rightPageNum = currentPage + 1;
  const leftViewable =
    currentPage <= previewLimit && currentPage <= (numPages || Infinity);
  const rightViewable =
    rightPageNum <= previewLimit && rightPageNum <= (numPages || Infinity);
  const canView = previewLimit === Infinity || leftViewable || rightViewable;
  const isEndSingle = leftViewable && rightPageNum > (numPages || 0);

  // cancel any in-progress renders
  const cancelRenderTasks = () => {
    const tasks = renderTasksRef.current || [];
    tasks.forEach((t) => {
      try {
        t.cancel?.();
      } catch (e) {
        // ignore
      }
    });
    renderTasksRef.current = [];
  };

  // load PDF document
  useEffect(() => {
    if (!contentUrl) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ url: contentUrl });
    loadingTask.promise
      .then((doc) => {
        if (cancelled) return;
        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        const lastLeft = getLastLeft(doc.numPages);

        // prefer parent's bookmarkedPage if provided (use left page for two-page spread)
        if (
          typeof bookmarkedPage === "number" &&
          !Number.isNaN(bookmarkedPage)
        ) {
          const left =
            bookmarkedPage % 2 === 1
              ? bookmarkedPage
              : Math.max(1, bookmarkedPage - 1);
          setCurrentPage(Math.min(left, lastLeft));
        } else {
          setCurrentPage(1 <= lastLeft ? 1 : lastLeft);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(String(err));
        setLoading(false);
      });

    return () => {
      cancelled = true;
      cancelRenderTasks();
      loadingTask.destroy?.();
      pdfDocRef.current = null;
    };
  }, [contentUrl]);

  // if parent updates bookmarkedPage after load, update left page
  useEffect(() => {
    if (!pdfDocRef.current) return;
    if (typeof bookmarkedPage !== "number" || Number.isNaN(bookmarkedPage))
      return;
    const lastLeft = numPages ? getLastLeft(numPages) : undefined;
    const left =
      bookmarkedPage % 2 === 1
        ? bookmarkedPage
        : Math.max(1, bookmarkedPage - 1);
    if (lastLeft !== undefined) setCurrentPage(Math.min(left, lastLeft));
  }, [bookmarkedPage, numPages]);

  // helper: render a page (without awaiting the render promise)
  const startRender = (
    page: pdfjsLib.PDFPageProxy,
    canvas: HTMLCanvasElement,
    zoomLevel: number,
  ) => {
    const viewport = page.getViewport({ scale: zoomLevel });
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get canvas context");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    return page.render({
      canvasContext: ctx,
      viewport,
    } as any) as pdfjsLib.RenderTask;
  };

  // render effect (simplified): render left/right pages in parallel, cancellable
  useEffect(() => {
    const render = async () => {
      const doc = pdfDocRef.current;
      const leftCanvas = canvasLeftRef.current;
      const rightCanvas = canvasRightRef.current;
      if (!doc || !leftCanvas) return;

      cancelRenderTasks();
      setError(null);
      setLoading(true);

      try {
        const pagePromises: Array<Promise<pdfjsLib.PDFPageProxy | null>> = [];

        pagePromises.push(
          leftViewable ? doc.getPage(currentPage) : Promise.resolve(null),
        );
        if (rightCanvas)
          pagePromises.push(
            rightViewable ? doc.getPage(rightPageNum) : Promise.resolve(null),
          );

        const pages = await Promise.all(pagePromises);

        const tasks: Array<pdfjsLib.RenderTask> = [];

        const leftPage = pages[0];
        if (leftPage) {
          const t = startRender(leftPage, leftCanvas, zoom);
          tasks.push(t);
        } else {
          // clear left canvas
          const ctx = leftCanvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
        }

        if (rightCanvas) {
          const rightPage = pages[1] || null;
          if (rightPage) {
            const t = startRender(rightPage, rightCanvas, zoom);
            tasks.push(t);
          } else {
            const ctx = rightCanvas.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
          }
        }

        renderTasksRef.current = tasks;

        // wait for all render promises (ignore rejections from cancel)
        await Promise.all(tasks.map((t) => t.promise.catch(() => {})));
        setLoading(false);
      } catch (err: any) {
        setError(String(err));
        setLoading(false);
      } finally {
        renderTasksRef.current = [];
      }
    };

    render();
    return () => cancelRenderTasks();
  }, [currentPage, zoom, numPages, previewLimit]);

  // navigation: ensure left page numbers (odd) and cap to last left
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 2));
  const goNext = () =>
    setCurrentPage((p) => {
      const lastLeft = numPages ? getLastLeft(numPages) : p + 2;
      return Math.min(p + 2, lastLeft);
    });

  // notify parent of current page changes
  useEffect(() => {
    try {
      onPageChange?.(currentPage, numPages);
    } catch (e) {
      // ignore
    }
  }, [currentPage, numPages]);

  return (
    <div className="flex flex-1 h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === 1}
            onClick={goPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page {currentPage} / {numPages || "—"}
          </span>

          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === numPages || currentPage >= previewLimit}
            onClick={goNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setZoom((z) => Math.max(0.25, +(z - 0.1).toFixed(2)))
            }
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span>{Math.round(zoom * 100)}%</span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.min(4, +(z + 0.1).toFixed(2)))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto p-6 bg-gray-200">
        {!canView ? (
          <div className="rounded-lg border bg-muted p-10 text-center">
            <h3 className="mb-2 text-lg font-semibold">Preview Ended</h3>

            <p className="mb-4 text-muted-foreground">
              Sign in to continue reading this book.
            </p>

            <Button>Sign In</Button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            {error ? (
              <div className="text-sm text-red-600">
                Error loading PDF: {error}
              </div>
            ) : isEndSingle ? (
              <div className="w-full flex items-center justify-center">
                <div className="relative">
                  <canvas ref={canvasLeftRef} className="shadow rounded" />
                  {!leftViewable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <div className="text-center">
                        <p className="mb-2 text-sm font-medium">
                          Sign in to continue
                        </p>
                        <Button size="sm">Sign In</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-6 items-start">
                <div className="relative">
                  <canvas ref={canvasLeftRef} className="shadow rounded" />
                  {!leftViewable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <div className="text-center">
                        <p className="mb-2 text-sm font-medium">
                          Sign in to continue
                        </p>
                        <Button size="sm">Sign In</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <canvas ref={canvasRightRef} className="shadow rounded" />
                  {!rightViewable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <div className="text-center">
                        <p className="mb-2 text-sm font-medium">
                          Sign in to continue
                        </p>
                        <Button size="sm">Sign In</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {loading && <div className="absolute">Loading…</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReadingPanel;
