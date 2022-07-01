## VTK.js - SceneExplorer with Label Support

Sparked by missing support for labels in the [vtk.js SceneExplorer example](https://kitware.github.io/vtk-js/examples/SceneExplorer.html), see discussion in the [Paraview Discourse Support Channel](https://discourse.paraview.org/t/trouble-exporting-scene-to-vtkjs/9829/10), the modified version of the SceneExplorer in this repository add support for labeling data points in scenes with a selected data array.
Starting from a verbatim copy of [the SceneExplorer example in the vtk.js github repository](https://github.com/Kitware/vtk-js/tree/master/Examples/Applications/SceneExplorer), the following changes and fixes have been applied:

* Provided webpack infrastructure for local building of the standalone html file
* Created a module that provides a widget where label arrays can be selected for all scene items. The widget visibility can be toggled by pressing the `l` key (similar to `c` for the rendering settings)
* Ensured that the background svg image is being inlined into the final single standalone html file
* Started working on picking support (not finshed, yet)

# Building / Usage
```
npm init
npm install @kitware/vtk.js
npm install -D webpack-cli webpack webpack-dev-server
npm install ... SOME MODULES ...    # TODO: still need to cleanup package.json
npx webpack --progress --mode=development
open dist/SceneExplorer.html
```
