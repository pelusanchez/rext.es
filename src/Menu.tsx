import React from 'react'
import { Params, vec2 } from 'rext-image-editor/dist/models/models'
import './style/slider.scss'
import MenuItems from './MenuItems.json'
import { Slider } from '@material-ui/core'
import './Slider.scss'
import { useTranslation } from 'react-i18next'
import { dblClick, deltaSpeed } from './utils'

export interface MenuProps {
  params: Params;
  disabled?: boolean;
  onChange(key: string, value: number) : void;
}

export const Menu = (props: MenuProps) => {

  const { t } = useTranslation('editor');
  const [ openedContainers, setOpenedContainers] = React.useState<{ [key: string]: boolean}> ({ "Tones": true });

  const switchContainer = (container: any) => {
    const updatedContainer = { ...openedContainers }
    if (updatedContainer[container.title] === undefined) {
      updatedContainer[container.title] = false
    }
    updatedContainer[container.title] = !updatedContainer[container.title]

    setOpenedContainers(updatedContainer)
  }

  const computeValue = (item: any) => {
    if (item.type === "scalar") {
      return props.params[item.id] as number;
    }
    
    if (item.type === "vec2") {
      const value = (props.params[item.id] as vec2).x as number;
      return {
        x: value,
        y: value,
      }
    }
    
    return (props.params[item.id] as any)[item.dimension];
  }

  return (<>
      {MenuItems.map(container => {
        return (
        <div className={`menu-container ${((openedContainers[container.title]) ? 'open': '')} ${(props.disabled) ? 'disabled': ''}` }>
          <div className="menu-container-title" onClick={e => switchContainer(container)}>
            <div className="text">{t(`editor:${container.title}`)}</div>
            <div className="expand-submenu-icon">+</div>
          </div>
          {container.items.map(item => {
            // @ts-ignore
            const value = computeValue(item)
            return (
              <div className="menu_item">
                <div className="text left">{t(`editor:${item.name}`)}</div>

                <Slider
                  onWheel={(e) => { 
                    const delta = deltaSpeed(e.deltaY);
                    const nextValue = value + item.step * delta;
                    if (nextValue <= item.min || nextValue >= item.max) {
                      return;
                    }
                    props.onChange(item.id, nextValue);
                  }}
                  onClick={(e) => { dblClick(() => props.onChange(item.id, item.value)) }}
                  className='slider'
                  min={item.min * 100} 
                  max={item.max * 100} 
                  defaultValue={item.value * 100} 
                  value={value * 100} 
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
