const baseParallax = 3;

function parallaxBackground(p){
    p.background(31,148,192,255);
    console.log(baseParallax);
    console.log(p.cloudsLayer.width);
    p.image(p.cloudsLayer,(-p.cameraOffset/(baseParallax+3))%p.width,0)
    p.image(p.cloudsLayer,(-p.cameraOffset/(baseParallax+3))%p.width + p.width,0)

    p.image(p.mountain2Layer,(-p.cameraOffset/(baseParallax+2))%p.width,-50)
    p.image(p.mountain2Layer,(-p.cameraOffset/(baseParallax+2))%p.width + p.width,-50)
    /*

    p.image(mountain1Layer,(-p.cameraOffset/(baseParallax+3))%p.width,0)
    p.image(mountain1Layer,(-p.cameraOffset/(baseParallax+3))%p.width + p.width,0)

    p.image(hillsLayer,(-p.cameraOffset/(baseParallax+2))%p.width,0)
    p.image(hillsLayer,(-p.cameraOffset/(baseParallax+2))%p.width + p.width,0)*/
    
    p.image(p.forest2Layer,(-p.cameraOffset/(baseParallax+1))%p.width,-30)
    p.image(p.forest2Layer,(-p.cameraOffset/(baseParallax+1))%p.width + p.width,-30)

    p.image(p.forest1Layer,(-p.cameraOffset/baseParallax)%p.width,0)
    p.image(p.forest1Layer,(-p.cameraOffset/baseParallax)%p.width + p.width,0)
}