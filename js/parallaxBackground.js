const baseParallax = 3;

function parallaxBackground(p){
    p.background(31,148,192,255);
    
    p.image(p.cloudsBackground,(-p.cameraOffset.x/(baseParallax+3))%p.width,0,p.width,p.height)
    p.image(p.cloudsBackground,(-p.cameraOffset.x/(baseParallax+3))%p.width + p.width,0,p.width,p.height)

    p.image(p.mountainBackground1,(-p.cameraOffset.x/(baseParallax+2))%p.width,-50,p.width,p.height)
    p.image(p.mountainBackground1,(-p.cameraOffset.x/(baseParallax+2))%p.width + p.width,-50,p.width,p.height)
    
    /*
    p.image(mountain1Layer,(-p.cameraOffset/(baseParallax+3))%p.width,0)
    p.image(mountain1Layer,(-p.cameraOffset/(baseParallax+3))%p.width + p.width,0)

    p.image(hillsLayer,(-p.cameraOffset/(baseParallax+2))%p.width,0)
    p.image(hillsLayer,(-p.cameraOffset/(baseParallax+2))%p.width + p.width,0)
    */
    
    p.image(p.forestBackground2,(-p.cameraOffset.x/(baseParallax+1))%p.width,-30,p.width,p.height)
    p.image(p.forestBackground2,(-p.cameraOffset.x/(baseParallax+1))%p.width + p.width,-30,p.width,p.height)

    p.image(p.forestBackground1,(-p.cameraOffset.x/baseParallax)%p.width,0,p.width,p.height)
    p.image(p.forestBackground1,(-p.cameraOffset.x/baseParallax)%p.width + p.width,0,p.width,p.height)
}