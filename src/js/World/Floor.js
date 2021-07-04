import { Mesh, Object3D, PlaneBufferGeometry } from "three"
import { MeshStandardMaterial } from "three/build/three.module"

export default class Floor {
  constructor(options) {
    // Set options
    // Set up
    this.container = new Object3D()
    this.container.name = 'Floor'

    this.setFloor()
  }
  setFloor() {
    this.floor = new Mesh()
    this.floorgeometry = new PlaneBufferGeometry(200, 200)
    this.floorMaterial = new MeshStandardMaterial({
      color: 0xffffff
    })

    this.floor.geometry = this.floorgeometry
    this.floor.material = this.floorMaterial
    this.floor.rotateX(-Math.PI/2)
    this.floor.position.set(0, -1, 0)

    this.container.add(this.floor)
  }
}