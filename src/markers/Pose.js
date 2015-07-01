/**
 * @author Brad Campbell - bradjc@umich.edu
 */

/**
 * Create a THREE arrow object from a geometry_msgs/PoseStamped message.
 *
 * @constructor
 * @param options - object with following keys:
 *
 *   * path - the base path or URL for any mesh files that will be loaded for this marker
 *   * message - the marker message
 *   * loader (optional) - the Collada loader to use (e.g., an instance of ROS3D.COLLADA_LOADER
 *                         ROS3D.COLLADA_LOADER_2) -- defaults to ROS3D.COLLADA_LOADER_2
 */
ROS3D.Pose = function(options) {
  options = options || {};
  var path = options.path || '/';
  var message = options.message;
  var loader = options.loader || ROS3D.COLLADA_LOADER_2;

  // check for a trailing '/'
  if (path.substr(path.length - 1) !== '/') {
    path += '/';
  }

  THREE.Object3D.call(this);

  // Make it blue
  this.msgColor = {
    r: 0.0,
    g: 0.0,
    b: 1.0,
    a: 1.0
  };

  // Set the pose and get the color
  var colorMaterial = ROS3D.makeColorMaterial(this.msgColor.r,
                                              this.msgColor.g,
                                              this.msgColor.b,
                                              this.msgColor.a);
  // Properties of the arrow that will be displayed
  var len = 1;
  var headLength = len * 0.23;
  var headDiameter = 0.2;
  var shaftDiameter = headDiameter * 0.5;

  // Create the arrow
  var origin = new THREE.Vector3(message.pose.position.x,
                                 message.pose.position.y,
                                 message.pose.position.z);
  var direction = new THREE.Vector3(1,0,0);

  var q = new THREE.Quaternion(message.pose.orientation.x,
                                         message.pose.orientation.y,
                                         message.pose.orientation.z,
                                         message.pose.orientation.w);
  direction.applyQuaternion(q);
  direction.normalize();

  // Add the arrow
  this.add(new ROS3D.Arrow({
    direction : direction,
    origin : origin,
    length : len,
    headLength : headLength,
    shaftDiameter : shaftDiameter,
    headDiameter : headDiameter,
    material : colorMaterial
  }));
};
ROS3D.Pose.prototype.__proto__ = THREE.Object3D.prototype;

/**
 * Update this marker.
 *
 * @param message - the marker message
 * @return true on success otherwhise false is returned
 */
ROS3D.Pose.prototype.update = function(message) {
  return true;
};

/*
 * Free memory of elements in this marker.
 */
ROS3D.Pose.prototype.dispose = function() {
  this.children.forEach(function(element) {
    if (element instanceof ROS3D.MeshResource) {
      element.children.forEach(function(scene) {
        if (scene.material !== undefined) {
          scene.material.dispose();
        }
        scene.children.forEach(function(mesh) {
          if (mesh.geometry !== undefined) {
            mesh.geometry.dispose();
          }
          if (mesh.material !== undefined) {
            mesh.material.dispose();
          }
          scene.remove(mesh);
        });
        element.remove(scene);
      });
    } else {
      if (element.geometry !== undefined) {
          element.geometry.dispose();
      }
      if (element.material !== undefined) {
          element.material.dispose();
      }
    }
    element.parent.remove(element);
  });
};
