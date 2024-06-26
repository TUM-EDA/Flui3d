
# Flui3d - Design Platform for 3D-Printed Microfluidic Devices
**Flui3d's Software Design and Architecture**

**Overview**

Unlike traditional EDA software, Flui3d is an open-source web-based application that offers a WYSIWYG (What You See Is What You Get) design interface. Users can effortlessly access the web-based design platform without the need to install any software. Flui3d employs a monolithic architecture, comprising two key components: the frontend and backend. The frontend handles all design aspects, while the backend generates STL files. The following diagram illustrates the workflow.

![Figure 1](https://github.com/TUM-EDA/Flui3d/assets/33457007/cf199429-c98f-4dfd-93a1-e895dbed2698)
Figure 1: Workflow of Flui3d.

**Frontend**

The frontend operates as a fully static environment, executing all applications and business processes locally on the client/browser side. It is developed in TypeScript and leverages Vue 3 as its primary framework. The UI design is predominantly crafted using HTML and CSS, with Bootstrap 5.2 providing additional support.

Every UI element, as well as components from our Standard Parameterized Component Library, is defined as Vue components. The UI logic is coded in TypeScript. All graphical representations, including shapes and microfluidic components on the screen, are defined in Scalable Vector Graphics (SVG).

The frontend communicates with the backend in an asynchronous manner, transmitting the design information created by the user. The design information encompasses geometric details such as shape, dimensions, and location. Subsequently, the frontend receives the STL data generated by the backend and presents it to the user.

After building the code, a purely static HTML with resource hints injection is generated with all other assets including libraries. These files can be hosted on any web server and serve as the frontend. 

**Backend**

The backend is exclusively implemented in Java and is composed of two crucial components: the servlet and the business logic. The servlet manages incoming requests and passes relevant information to the business logic. Within the business logic, a parser interprets the incoming data and invokes corresponding methods to construct the requested shapes as facets. Subsequently, the facets are transformed into STL data content and sent back to the servlet, which, in turn, responds to the originating source.

We have abstracted various shapes integral to microfluidic design into the following primitive types and classes: cuboid, cylinder, chamfer, torus, square ring, polygon prism. Microfluidic components, such as channels or chambers, are created by combining these primitive types. The generation process follows the application of the factory design pattern.

The backend can be hosted using Tomcat. 

# Getting Started
You can try Flui3d at https://flui3d.org. If you would like to further develop Flui3d or host Flui3d on your own server, please follow the instructions:

**Get The Code**
Download or clone this repository. The Frontend folder contains the source code for the frontend web app and the Backend folder contains the source code for the backend.

**Frontend:**
Before building the code, you should change the value of `const postUrl = "https://to.your.backend"` in `Frontend/src/library/hardCodedValues.ts` at line 13 to your own backend's address. 

**Project setup**
```  
npm install  
```  
**Compiles and hot-reloads for development**
```  
npm run serve  
```  
  
**Compiles and minifies for production**
```  
npm run build
```  
The built files can be hosted on any web server.

**Backend:**
For the backend, the newest JDK version is recommended. You can build the WAR artifact and host it using Tomcat 11.
***

### 🎉 If You Find **Flui3d** Helpful
Please consider citing our work:

Zhang, Y., Li, M., Tseng, TM. _et al._ Open-source interactive design platform for 3D-printed microfluidic devices. _Commun Eng_ **3**, 71 (2024). [https://doi.org/10.1038/s44172-024-00217-0](https://doi.org/10.1038/s44172-024-00217-0)

```
@article{zhang2024open,
  title={Open-source interactive design platform for 3D-printed microfluidic devices},
  author={Zhang, Yushen and Li, Mengchu and Tseng, Tsun-Ming and Schlichtmann, Ulf},
  journal={Communications Engineering},
  volume={3},
  number={1},
  pages={71},
  year={2024},
  publisher={Nature Publishing Group UK London}
}
```
***
### LICENSE
Flui3d is open source and licensed under the [Apache License version 2.0](https://github.com/TUM-EDA/Flui3d/blob/main/LICENSE). Please note that we reserve the right to change the license at any time without notice.
