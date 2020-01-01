# TODO
1. Write and test Sphere ray collision algorithm - DONE
2. Write base RenderObject class to handle commonalities like color, center etc.
3. Fix t value problem - DONE
4. Create scene class and fit the work done so far into that framework. - DONE
5. Illumination time!
    I suppose after the collision location is determined, run through every light source (given that object's light interaction properties) and calculate the color of the object at that location. It's wasteful to calculate it prior to knowing iw will be visible.
    Recursively through every object for the color?
    reCURSE:
        1. Direct light effect of all lights
        2. Reflected light effect of all OTHER objects !(how to prevent infinite loop) 
    For now let's just do direct light effect.
    DONE
6. Shadows
        At each illumination construction section, if the light ray intersects another object between the original point on object and the light's position, ignore specular and diffuse components of the local light value.
   DONE
7. Reflections
        Material should have reflectivity constant. 
        diffuse constant and reflectivity constant are roughly inversely related. 
    DONE
8. Distributed ray tracing and anti-aliasing
9.  Edge detection (t difference limit)
10. Multisampling antialiasing (SAA at the edges)
11. Soft shadows
        By modeling a light source as a 2D interval and distributing shadow rays over that interval, soft shadows can be rendered.