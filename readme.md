# raytracer
## What
`raytracer` is an exercise in linear algebra used to render delicious-looking objects. It supports diffuse and specular lighting, shadows, antialiasing, and recursive rendering for reflections. The only catch is: you can only render spheres.

Try it [here](https://halilcan.github.io/raytracer/)!

### Current Goals
- Dare I say... polygons?! Normals would be easy, though I am foreseeing great troubles if I don't reduce the intersection-search range. Perhaps a convex 'sleeve' for complex objects that work as a stepping stone. If the larger sleeve isn't intersected, a polygon within the sleeve definitely is not. How to make the sleeves... Spheres? Rastering onto screen?
- Also, a good stepping stone (conceptually) to a 2d rendering engine for games. (like `hex`, hopefully)

---
## Why
It's interesting. Also, it's a great example of how essential linalg is in "the real world".

---
## How
### Implementation
Mostly a combination of a very long flight and javascript. Positions are vectors, colors are (almost) vectors, material are vectors, everything is vectors!

It starts with a `camera` and a virtual `screen` in front of it. Depending on the viewing resolution and multisampling size, a `ray` is sent from the `camera` to roughly at where each `pixel` would correspond to in the virtual `screen`.

If the `ray` intersects an object, determined by running a quadratic equation on the 3d limits of the objects and the direction of the `ray`, the color found at the closest intersection determines the color that will be displayed on the `pixel` that corresponds to that `ray`. (or the virtual `pixel` it was sent through mapped to the real `pixel` we see)

The color at the intersection is determined in a lengthy process: First we cast a `ray` at it from every `light` in the scene. Occluded `rays` drop shadows (essentially darken the color at that location). Non-occluded rays add color to the location based on the angle of the `ray` falling on the object and the `material` properties of the object the `location` is on. Finally, we reflect the original `ray` that was cast from the `camera` off of the current `location`, and if it intersects another object, we repeat the color-determination process recursively until we reach a predetermined depth. (Unfortunately, a hall of mirrors would fry my poor laptop.) We add these colors based on the reflectivity property of the reflected object's `material`. 

Made by following the theory on [Avik Das](https://github.com/avik-das/)'s excellent [3d renderer workshop](https://avikdas.com/build-your-own-raytracer/).
### Usage
As it is, you have to edit the file raytracer.js. Due to local development constraints with `modules`, I had to put everything in one file. :( 

Specifically, you can adjust the elements as follows:
- Camera location and FOV: 
  - `camPosition` is a global-scope `Vector` that determines camera positon. 
  - The relative direction of the vectors from the camera to `imagePlane`'s four "corners" will determine FOV.
- Canvas size: 
  - `screenW` and `screenH`. If the image appears stretched, make sure the distances between `imagePlane` vectors are proportional to the height and width of the viewport/canvas.
- Lights
  - Lights are `pointLight` objects with `Vector` positions and `Color` diffuseIntensity/specularIntensity properties. They are currently generated in `raySphCollisionTest` with examples.
- Spheres
  - Spheres are `Sphere` objects with `Vector` positions and `Material` material properties (shininess etc.). They are currently generated in `raySphCollisionTest` with examples.

Finally, `index.html` will display a local page with the render on a canvas.