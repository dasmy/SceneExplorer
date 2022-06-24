
import vtkPixelSpaceCallbackMapper from '@kitware/vtk.js/Rendering/Core/PixelSpaceCallbackMapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';


export default function addWidget(renderer, container, sceneItems, render) {

    let dims = null;

    const textCanvas = document.createElement('canvas');
    textCanvas.classList.add('labelCanvas');
    textCanvas.style.position = 'absolute';
    textCanvas.style.top = '0px';
    textCanvas.style.left = '0px';
    textCanvas.style.width = '100%';
    textCanvas.style.height = '100%';
    textCanvas.style.overflow = 'hidden';
    renderer.getContainer().appendChild(textCanvas);

    const textCtx = textCanvas.getContext('2d');

    window.addEventListener('resize', () => {
        dims = container.getBoundingClientRect();
        textCanvas.setAttribute('width', dims.width);
        textCanvas.setAttribute('height', dims.height);
        render();
      });

    window.dispatchEvent(new Event("resize"));

    for (const sceneItem of sceneItems) {
       console.log(`Adding labels to ${sceneItem.name}`)

        const psMapper = vtkPixelSpaceCallbackMapper.newInstance();
        psMapper.setInputConnection(sceneItem.source.getOutputPort());
        psMapper.setCallback((coordsList) => {
        if (textCtx && dims) {
            textCtx.clearRect(0, 0, dims.width, dims.height);
            coordsList.slice(0, 100).forEach((xy, idx) => {
            textCtx.font = '12px serif';
            textCtx.textAlign = 'center';
            textCtx.textBaseline = 'middle';
            textCtx.fillText(`p ${idx}`, xy[0], dims.height - xy[1]);
            });
            }
        });

        const textActor = vtkActor.newInstance();
        textActor.setMapper(psMapper);
        renderer.getRenderer().addActor(textActor);
    }
}
