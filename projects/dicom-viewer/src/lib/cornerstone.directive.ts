import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';


declare const cornerstone;
declare const cornerstoneTools;




@Directive({
  selector: '[cornerstone]',
})

export class CornerstoneDirective implements OnInit {

  public element: any;

  public imageList = [];
  private imageIdList = [];
  public currentIndex = 0;
  public patientName = ''; // current image Patient name, do display on the overlay
  public hospital = ''; // current image Institution name, to display on the overlay

  public get windowingValue():string {
    var viewport = cornerstone.getViewport(this.element);
    if (viewport) {return Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter);}
    else return '';
  }

  public get zoomValue():string {
    var viewport = cornerstone.getViewport(this.element);
    if (viewport) {return viewport.scale.toFixed(2);}
    else return '';
  }

  constructor(private elementRef: ElementRef) {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    cornerstone.resize(this.element, true);
  }

  //@HostListener('mousewheel', ['$event'])
  onMouseWheel(event) {
    event.preventDefault();

    if (this.imageList.length > 0) {
      const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
      // console.log(event);
  
  
      if (delta > 0) {
        this.currentIndex++;
        if (this.currentIndex >= this.imageList.length) {
          this.currentIndex = this.imageList.length - 1;
        }
      } else {
  
        this.currentIndex--;
        if (this.currentIndex < 0) {
          this.currentIndex = 0;
        }
  
      }
  
      this.displayImage(this.imageList[this.currentIndex]);
    }

  }

  ngOnInit() {

    // Retrieve the DOM element itself
    this.element = this.elementRef.nativeElement;

    // Enable the element with Cornerstone
    cornerstone.enable(this.element);

  }

  public resetImageCache() {
    //cornerstone.imageCache.purgeCache();
    //cornerstone.reset(this.element);
    this.imageList = [];
    this.imageIdList = [];
  }

  public previousImage() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = 0;
      }
    this.displayImage(this.imageList[this.currentIndex]);

  }

  public nextImage() {
      this.currentIndex++;
      if (this.currentIndex >= this.imageList.length) {
        this.currentIndex = this.imageList.length - 1;
      }
     this.displayImage(this.imageList[this.currentIndex]);
 }
  
  public addImageData(imageData: any) {
    //if (!this.imageList.filter(img => img.imageId === imageData.imageId).length) {
      this.imageList.push(imageData);
      this.imageIdList.push(imageData.imageId);
      if (this.imageList.length === 1) {
        this.currentIndex = 0;
        this.displayImage(imageData);
      }
    //}
    
    cornerstone.resize(this.element, true);
  }

  public displayImage(image) {
    const viewport = cornerstone.getDefaultViewportForImage(this.element, image);
    cornerstone.displayImage(this.element, image, viewport);
    // Fit the image to the viewport window
    cornerstone.fitToWindow(this.element);
    cornerstone.resize(this.element, true);

    // get image info to display in overlays
    this.patientName = image.data.string('x00100010').replace(/\^/g,'');
    this.hospital = image.data.string('x00080080');

    // Activate mouse clicks, mouse wheel and touch
    cornerstoneTools.mouseInput.enable(this.element);
    cornerstoneTools.mouseWheelInput.enable(this.element);
    //cornerstoneTools.touchInput.enable(this.element);
    cornerstoneTools.keyboardInput.enable(this.element);

    // Enable all tools we want to use with this element
    cornerstoneTools.wwwc.activate(this.element, 1); // ww/wc is the default tool for left mouse button
    cornerstoneTools.pan.activate(this.element, 2); // pan is the default tool for middle mouse button
    cornerstoneTools.zoom.activate(this.element, 4); // zoom is the default tool for right mouse button
    cornerstoneTools.probe.enable(this.element);
    cornerstoneTools.length.enable(this.element);
    cornerstoneTools.angle.enable(this.element);
    cornerstoneTools.simpleAngle.enable(this.element);
    cornerstoneTools.ellipticalRoi.enable(this.element);
    cornerstoneTools.rectangleRoi.enable(this.element);
    cornerstoneTools.wwwcTouchDrag.activate(this.element) // - Drag
    cornerstoneTools.zoomTouchPinch.activate(this.element) // - Pinch
    cornerstoneTools.panMultiTouch.activate(this.element) // - Multi (x2)

    // Stack tools

    // Define the Stack object
    const stack = {
      currentImageIdIndex: this.currentIndex,
      imageIds: this.imageIdList
    };

    cornerstoneTools.addStackStateManager(this.element, ['playClip']);
    // Add the stack tool state to the enabled element
    cornerstoneTools.addStackStateManager(this.element, ['stack']);
    cornerstoneTools.addToolState(this.element, 'stack', stack);
    cornerstoneTools.stackScrollWheel.activate(this.element);
    // Enable all tools we want to use with this element
    cornerstoneTools.stackScrollKeyboard.activate(this.element);
    //cornerstoneTools.stackPrefetch.enable(this.element);

  }


  // cornerstone.displayImage(this.element, image);

}
