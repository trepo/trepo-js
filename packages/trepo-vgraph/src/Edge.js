import Constant from './Constant.js';
import Element from './Element.js';
import Node from './Node.js';

/**
 * An Edge in vGraph.
 */
class Edge extends Element {

  /**
   * Create a new Edge.
   *
   * @param  {Vagabond} element The Vagabond Element to wrap.
   * @param  {VGraph} vGraph The vGraph instance.
   */
  constructor(element, vGraph) {
    super(element, vGraph);
  }

  /**
   * Get the Node this Edge is connected to.
   *
   *  Node --OUT--> Edge --IN--> Node
   *
   * @param  {Direction} direction The Direction.
   * @return {Promise<Node>} A Promise resolving to the connected Node.
   */
  getNode(direction) {
    return new Promise((resolve, reject) => {
      this._element.getProperty(Constant.STATUS)
        .then(status => {
          if (status >= 4) {
            throw new Error('Deleted');
          } else {
            return this._element.getNode(direction);
          }
        })
        .then(node => resolve(new Node(node, this._vGraph)))
        .catch(reject);
    });
  }
}

export default Edge;
