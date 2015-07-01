/**
 * @author Brad Campbell - bradjc@umich.edu
 */

/**
 * A client for displaying poses 'geometry_msgs/PoseStamped'
 *
 * Emits the following events:
 *
 *  * 'change' - there was an update or change in the marker
 *
 * @constructor
 * @param options - object with following keys:
 *
 *   * ros - the ROSLIB.Ros connection handle
 *   * topic - the marker topic to listen to
 *   * tfClient - the TF client handle to use
 *   * rootObject (optional) - the root object to add this marker to
 *   * path (optional) - the base path to any meshes that will be loaded
 *   * loader (optional) - the Collada loader to use (e.g., an instance of ROS3D.COLLADA_LOADER
 *                         ROS3D.COLLADA_LOADER_2) -- defaults to ROS3D.COLLADA_LOADER_2
 */
ROS3D.PoseClient = function(options) {
  var that = this;
  options = options || {};
  var ros = options.ros;
  var topic = options.topic;
  this.tfClient = options.tfClient;
  this.rootObject = options.rootObject || new THREE.Object3D();
  this.path = options.path || '/';
  this.loader = options.loader || ROS3D.COLLADA_LOADER_2;

  // Markers that are displayed (Map ns+id--Marker)
  this.poses = {};

  // subscribe to the topic
  var rosTopic = new ROSLIB.Topic({
    ros : ros,
    name : topic,
    messageType : 'geometry_msgs/PoseStamped',
    compression : 'png'
  });
  rosTopic.subscribe(function(message) {

    var newPose = new ROS3D.Pose({
      message : message,
      path : that.path,
      loader : that.loader
    });

    // remove old marker from Three.Object3D children buffer
    that.rootObject.remove(that.poses[message.ns + message.id]);

    that.poses[message.ns + message.id] = new ROS3D.SceneNode({
      frameID : message.header.frame_id,
      tfClient : that.tfClient,
      object : newPose
    });
    that.rootObject.add(that.poses[message.ns + message.id]);

    that.emit('change');
  });
};
ROS3D.PoseClient.prototype.__proto__ = EventEmitter2.prototype;
