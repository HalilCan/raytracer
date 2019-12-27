# TODO
1. Write and test Sphere ray collision algorithm - DONE
2. Write base RenderObject class to handle commonalities like color, center etc.
3. Fix t value problem
4. Illumination time!
    I suppose after the collision location is determined, run through every light source (given that object's light interaction properties) and calculate the color of the object at that location. It's wasteful to calculate it prior to knowing iw will be visible.
    Recursively through every object for the color?
    reCURSE:
        1. Direct light effect of all lights
        2. Reflected light effect of all OTHER objects !(how to prevent infinite loop) 
