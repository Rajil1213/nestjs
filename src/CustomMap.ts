export interface Mappable {
  location: {
    lat: number;
    lng: number;
  };

  markerContent(): string;
}

export class CustomMap {
  private googleMap: google.maps.Map;

  constructor(elementID: string) {
    this.googleMap = new google.maps.Map(document.getElementById(elementID) as HTMLElement, {
      zoom: 1,
      center: {
        lat: 0,
        lng: 0
      }
    });
  }

  addMarker(this: CustomMap, mappable: Mappable): void {
    const marker = new google.maps.Marker({
      map: this.googleMap,
      position: mappable.location
    });

    marker.addListener("click", function (this: CustomMap) {
      const infoWindow = new google.maps.InfoWindow({
        content: mappable.markerContent()
      });

      infoWindow.open(this.googleMap, marker);
    });
  }
}
