import React from 'react'
import './desktop.scss';
import './style/normalize.css';
import './style/scrollbar.scss'
import Menu from './Menu'
import { RextEditor } from 'rext-image-editor/dist'
import { Params } from 'rext-image-editor/dist/models/models';
import { defaultParams } from './defauls'

const Rext : RextEditor = new RextEditor()

const App = React.memo(() => {

  document.title = 'Rext Image Editor'
  const [ isLoaded, setIsLoaded ] = React.useState<boolean>(false);
  const [ params, setParams ] = React.useState<Params>(defaultParams);

  const canvasRef = React.createRef<HTMLCanvasElement>();
  const inputRef = React.createRef<HTMLInputElement>();

  const loadImage = (e: any) => { 
    const files : FileList = e.target.files
    const file = files[0]
    if (!isLoaded) {
      Rext.setCanvas(canvasRef.current!)
      setIsLoaded(true)
    }
    Rext.load(URL.createObjectURL(file))
  }

  const onChange = (key: string, value: number) => { 
    const nextParams = { ...params, [key]: value }
    updateParams(nextParams)
  }

  const updateParams = (nextParams: Params) => {
    if (!isLoaded) {
      return;
    }
    setParams(nextParams)
    Rext.updateParams(nextParams)
    Rext.update();
  }

  const download = async () => {
    if (!isLoaded) {
      return;
    }
    const blob = await Rext.blob()
    const url = URL.createObjectURL(blob);
    const dlLink = document.createElement("a");
    dlLink.href = url;
    dlLink.download = "image.jpg";
    document.body.append(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
    URL.revokeObjectURL(url);
  }

  const reset = () => {
    updateParams(defaultParams)
  }

  return (
    <div className="rext">
      <div className="rext-container">
        <div className="rext-toolbar">
          <div className="box-buttons">
            <div id="image-open" className="box-button" onClick={() => inputRef.current?.click()}>
              <div className="box-button-image">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/><path d="M0 0h24v24H0z" fill="none"/></svg>
              </div>
              <span>Abrir</span>
            </div>
            <div className="box-button data-action" data-action="reset" onClick={() => reset() }>
              <div className="box-button-image">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path fill="white" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
              </div>
              <span>Reiniciar</span>
            </div>
            <div id="image-save" className="box-button" onClick={() => download()}>
              <div className="box-button-image">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path fill="white" d="M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z"/></svg>
              </div>
              <span>Guardar</span>
            </div>
          </div>

          <Menu onChange={onChange} params={params}></Menu>
        </div>
        <div className="rext-canvas">
          <div id="canvas_info" style={{"color": "#FFFFFF" }} className={ (isLoaded) ? "hidden" : "" }>
            Para comenzar, abra una imagen
          </div>
          <canvas id="image_main" ref={canvasRef} className={ (!isLoaded) ? 'hidden' : "" } width="400" height="400"></canvas>
        </div>
        <input type="file" id="image_data" accept="image/*" ref={inputRef} onChange={loadImage}></input>
      </div>
    </div>
  );
})

export default App;
