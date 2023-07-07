import {LitElement, html, css} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import WebViewer from '@pdftron/pdfjs-express';

/**
 * An example pdf viewer.
 *
 */
@customElement('pdf-viewer')
export class PdfViewer extends LitElement {
  static styles = css`
    :host{
      width: 100%;
      height:100%;
    }
    .full {
      width: 100%;
      height: 100%;
    }
    .hidden {
      display:none;
    }
  `;

  @property()
  pdfURL: string | undefined;

  @property()
  extensionTimeouMs: number = 2000;

  @state()
  isRendered = false;

  @query('#pdf-viewer')
  declare pdfViewerElement: Element;

  async firstUpdated() {
    if(!this.pdfURL) throw Error('pdfURL property is mandatory');
    console.log(this.pdfViewerElement)
    const pdfViewerInstance = await WebViewer(
      {
        path: './webviewer/lib',
        initialDoc: this.pdfURL,
      },
      this.pdfViewerElement,
    );
    //PDF viewer features would go here 
    this.onPdfViewerInstantiated(pdfViewerInstance);

    //Extension point
    const isExtended = await new Promise((r) => {
      //max time to wait in order to extend the PDF viewer
      const timeout = setTimeout(()=> r(false), this.extensionTimeouMs);
      let event = new CustomEvent('pdf-viewer-extension-event', 
      { 
        detail: {
          pdfViewerInstance: pdfViewerInstance,
          pdfViewerReady:()=> {
            clearTimeout(timeout);
            r(true);
          }
        }
      });
      this.dispatchEvent(event);
    });
    console.info(`External PDF extension ${isExtended}`);
    this.isRendered = true;
  }


  onPdfViewerInstantiated(instance: unknown){
    console.log(instance);
    //whatever default configuration
  }

  loader(){
    if(this.isRendered) return;
    return html`...loader`
  }

  render() {
    console.log('render');
    return html`
      ${this.loader()}
      <div id="pdf-viewer" class="full ${this.isRendered ? '': 'hidden'}"></div>
    `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'pdf-viewer': PdfViewer;
  }
}
