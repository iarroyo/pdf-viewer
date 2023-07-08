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
  eventTimeoutMs: number = 2000;

  @property()
  declare callback: (pdfInstance:unknown)=> Promise<void> | undefined;

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

    //External PDF viewer extension
    const isExtended =  await this.onPdfViewerExtended(pdfViewerInstance);
    console.info(`PDF viewer has been extended ${isExtended}`);
    this.isRendered = true;
  }

  async onPdfViewerExtended(pdfInstance:unknown): Promise<boolean> {
    //Extension point by callback
    if(this.callback !== undefined){
      await this.callback(pdfInstance);
      return true;
    }else{
    //Extension point by event
    return await new Promise((r) => {
      //max time to wait in order to extend the PDF viewer
      const timeout = setTimeout(()=> r(false), this.eventTimeoutMs);
      let event = new CustomEvent('pdf-viewer-extension-event', 
      { 
        detail: {
          pdfViewerInstance: pdfInstance,
          pdfViewerReady:()=> {
            clearTimeout(timeout);
            r(true);
          }
        }
      });
      this.dispatchEvent(event);
    });
    }
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
