package swim.matrixlabs;

import swim.api.SwimRoute;
import swim.api.agent.AgentRoute;
import swim.api.plane.AbstractPlane;
import swim.client.ClientRuntime;
import swim.fabric.Fabric;
import swim.kernel.Kernel;
import swim.server.ServerLoader;
import swim.structure.Value;
import swim.uri.Uri;

/**
  The ApplicationPlane is the top level of the app.
  This Swim Plane defines the routes to each WebAgent
 */
public class ApplicationPlane extends AbstractPlane {

  /**
   * The Settings Agent handles the color state for the light
   * or other setting.
   */
  @SwimRoute("/settings/:id")
  AgentRoute<SettingsAgent> settingsAgent;

  /**
   * NFC Agent handles all NFC data read in from the Matrix Board
   */
  @SwimRoute("/nfc")
  AgentRoute<NfcAgent> nfcAgent;

  public static void main(String[] args) throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServer();  // define our swim server kernel
    final Fabric fabric = (Fabric) kernel.getSpace("matrixlabs"); // define our data fabric

    //start the app
    kernel.start();
    System.out.println("Running Matrix Labs NFC Demo...");
    kernel.run();

  }
}
