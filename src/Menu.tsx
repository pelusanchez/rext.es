import React from 'react'
import { Params } from 'rext-image-editor/dist/models/models'
import './style/slider.scss'
import MenuItems from './MenuItems.json'
import { Slider } from '@material-ui/core'
import './Slider.scss'

export interface MenuProps {
  params: Params;
  onChange(key: string, value: number) : void;
}

export const Menu = (props: MenuProps) => {
  
  const [ openedContainers, setOpenedContainers] = React.useState<{ [key: string]: boolean}> ({ "Tones": true });

  const switchContainer = (container: any) => {
    const updatedContainer = { ...openedContainers }
    if (updatedContainer[container.title] === undefined) {
      updatedContainer[container.title] = false
    }
    updatedContainer[container.title] = !updatedContainer[container.title]

    setOpenedContainers(updatedContainer)
  }

  return (<>
      {MenuItems.map(container => {
        return (
        <div className={"menu-container " + ((openedContainers[container.title]) ? 'open': '') }>
          <div className="menu-container-title" onClick={e => switchContainer(container)}>
            <div className="text">{container.title}</div>
            <div className="expand-submenu-icon">+</div>
          </div>
          {container.items.map(item => {
            return (
              <div className="menu_item">
                <div className="text left">{item.name}</div>

                <Slider  
                  className='slider'
                  min={item.min * 100} 
                  max={item.max * 100} 
                  defaultValue={item.value * 100} 
                  value={props.params[item.id] * 100} 
                  step={item.step} 
                  onChange={(e, v) => { props.onChange(item.id, (v as number) / 100) }} />
              </div>)
          })}
        </div>
        )
      })}
</>)
} 

export default Menu
