
import vtkPixelSpaceCallbackMapper from '@kitware/vtk.js/Rendering/Core/PixelSpaceCallbackMapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import style from './SceneExplorer.module.css';


export default function addWidget(renderer, menuContainer, viewContainer, sceneItems, render) {

    let dims = null;

    window.addEventListener('resize', () => {
        dims = viewContainer.getBoundingClientRect();
        render();
      });

    window.dispatchEvent(new Event("resize"));

    function getArrayNames(sceneItem) {
        return `<option value="0">---</option>`
            + sceneItem.source.getArrays()
                // introduced "+1" in array index, so that "0" means "no labels"
                .map((array, idx) => `<option value="${idx+1}">${array.name}</option>`)
                .join('');
    }

    const listStr = sceneItems
        .map(
        (item, idx) =>
            `<li><select name="${idx}">${getArrayNames(item)}</select>&nbsp;&nbsp;${item.name}</li>`
        )
        .join('');

    const listContainer = document.createElement('ul');
    listContainer.innerHTML = listStr;
    listContainer.setAttribute('class', style.menu);
    menu.appendChild(listContainer);
    menuContainer.appendChild(menu);

    document.querySelector('body').addEventListener('keypress', (e) => {
      if (String.fromCharCode(e.charCode) === 'l') {
        if (listContainer.style.display === 'none') {
          listContainer.style.display = 'block';
        } else {
          listContainer.style.display = 'none';
        }
      }
    });

    const selectList = listContainer.querySelectorAll('select');
    for (let i = 0; i < selectList.length; i++) {
      const selectElem = selectList[i];
      selectElem.addEventListener('change', handleChange);
    }

    function handleChange(e) {
        const itemIdx = Number(e.target.name);
        const value = Number(e.target.value);
        // ugly hack: we just append an attribute to the sceneItem
        sceneItems[itemIdx].labelArray = value;
        if (render) {
            render();
        }
    }

    for (const sceneItem of sceneItems) {
        console.log(`Adding labels to ${sceneItem.name}`)

        const textCanvas = document.createElement('canvas');
        textCanvas.id = `textCanvas-${sceneItem.name}`
        textCanvas.classList.add('labelCanvas');
        textCanvas.style.position = 'absolute';
        textCanvas.style.top = '0px';
        textCanvas.style.left = '0px';
        textCanvas.style.width = '100%';
        textCanvas.style.height = '100%';
        textCanvas.style.overflow = 'hidden';
        renderer.getContainer().appendChild(textCanvas);

        const psMapper = vtkPixelSpaceCallbackMapper.newInstance();
        psMapper.setInputConnection(sceneItem.source.getOutputPort());
        psMapper.setCallback((coordsList) => {
        if (dims) {
            textCanvas.setAttribute('width', dims.width);
            textCanvas.setAttribute('height', dims.height);

            const textCtx = textCanvas.getContext('2d');
            textCtx.clearRect(0, 0, dims.width, dims.height);

            const labelArray = sceneItem.labelArray;

            if (labelArray) {
                coordsList.forEach((xy, idx) => {
                    textCtx.font = '12px serif';
                    textCtx.textAlign = 'center';
                    textCtx.textBaseline = 'middle';
                    console.log(`${sceneItem.source.getArrays()[labelArray-1].array.values[idx]}: ${xy[0] / window.devicePixelRatio}, ${dims.height - xy[1] / window.devicePixelRatio}`);
                    textCtx.fillText(
                        // "-1" to compensate for offset introduced in getArrays()
                        `${sceneItem.source.getArrays()[labelArray-1].array.values[idx]}`,
                        // pixel ratio scaling from https://github.com/Kitware/vtk-js/issues/1179#issuecomment-544709725
                        xy[0] / window.devicePixelRatio,
                        dims.height - xy[1] / window.devicePixelRatio);
                    });
              }
            }
        });

        const textActor = vtkActor.newInstance();
        textActor.setMapper(psMapper);
        renderer.getRenderer().addActor(textActor);
    }
}
