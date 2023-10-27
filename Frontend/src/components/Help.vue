<template>
  <div class="container">
    <div
      class="modal modal-xl fade"
      id="helpModal"
      tabindex="-1"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Help/Tutorial</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- insert video  -->
            <!-- <video src=""></video> -->

            <video controls width="100%">
              <source src="/quick_guide.mp4" type="video/mp4; codecs=hevc">
              <source src="/quick_guide.mp4" type="video/mp4; codecs=hvc1">
              <source src="/quick_guide_h264.mp4" type="video/mp4; codecs=avc1">
              <source src="/quick_guide_h264.mp4" type="video/mp4; codecs=avc1.42E01E">
            </video>
            <br>
            <h6>Usage</h6>
            <table>
              <thead>
              <tr>
                <th>Key/Shortcut </th>
                <th>&nbsp;</th>
                <th>Function/Description </th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>Tab</td>
                <td>&nbsp;</td>
                <td>Change Snap and Move Precision</td>
              </tr>
              <tr>
                <td>Shift (Hold)</td>
                <td>&nbsp;</td>
                <td>Keep Channel Horizontal/Vertical While Drawing</td>
              </tr>
              <tr>
                <td>Space (Hold)</td>
                <td>&nbsp;</td>
                <td>Move Canvas</td>
              </tr>
              <tr>
                <td>Ctrl + C</td>
                <td>&nbsp;</td>
                <td>Copy Selected Item(s)</td>
              </tr>
              <tr>
                <td>Ctrl + V</td>
                <td>&nbsp;</td>
                <td>Paste Item(s)</td>
              </tr>
              <tr>
                <td>Ctrl + Z</td>
                <td>&nbsp;</td>
                <td>Undo</td>
              </tr>
              <tr>
                <td>Del</td>
                <td>&nbsp;</td>
                <td>Delete Selected Item(s)</td>
              </tr>
              <tr>
                <td>Right Mouse Click</td>
                <td>&nbsp;</td>
                <td>Stop Drawing and Confirm</td>
              </tr>
              <tr>
                <td>Mouse Scroll</td>
                <td>&nbsp;</td>
                <td>Zoom</td>
              </tr>
              </tbody>
            </table>
            <br>
            <h6>Open Source Project Acknowledgements</h6>
            This project utilizes the following open source projects, which are distributed under their respective licenses. We are grateful to the contributors of these projects for their valuable work:
            <br>
            <table>
              <thead>
              <tr>
                <th>Project</th>
                <th>Repository</th>
                <th>License</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>Bootstrap 5</td>
                <td><a href="https://github.com/twbs/bootstrap">GitHub Repository</a></td>
                <td><a href="https://github.com/twbs/bootstrap/blob/main/LICENSE">MIT License</a></td>
              </tr>
              <tr>
                <td>FileSaver.js</td>
                <td><a href="https://github.com/eligrey/FileSaver.js">GitHub Repository</a></td>
                <td><a href="https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md">MIT License</a></td>
              </tr>
              <tr>
                <td>JSZip</td>
                <td><a href="https://github.com/Stuk/jszip">GitHub Repository</a></td>
                <td><a href="https://github.com/Stuk/jszip/blob/main/LICENSE.markdown">MIT License</a></td>
              </tr>
              <tr>
                <td>Pinia</td>
                <td><a href="https://github.com/vuejs/pinia">GitHub Repository</a></td>
                <td><a href="https://github.com/vuejs/pinia/blob/main/LICENSE">MIT License</a></td>
              </tr>
              <tr>
                <td>svg-path-parser</td>
                <td><a href="https://github.com/hughsk/svg-path-parser">GitHub Repository</a></td>
                <td><a href="https://github.com/hughsk/svg-path-parser/blob/master/LICENSE">MIT License</a></td>
              </tr>
              <tr>
                <td>Three.js</td>
                <td><a href="https://github.com/mrdoob/three.js/">GitHub Repository</a></td>
                <td><a href="https://github.com/mrdoob/three.js/blob/dev/LICENSE">MIT License</a></td>
              </tr>
              <tr>
                <td>Vue I18n Next</td>
                <td><a href="https://github.com/intlify/vue-i18n-next">GitHub Repository</a></td>
                <td><a href="https://github.com/intlify/vue-i18n-next/blob/main/LICENSE">MIT License</a></td>
              </tr>
              <tr>
                <td>Vue3 Popper</td>
                <td><a href="https://github.com/valgeirb/vue3-popper">GitHub Repository</a></td>
                <td><a href="https://github.com/valgeirb/vue3-popper/blob/main/LICENSE">MIT License</a></td>
              </tr>
              </tbody>
            </table>

            <p>All credit for these open source projects goes to their respective authors and contributors.</p>

            Your design data will not be stored on our servers. You can save your design by downloading the project and the generated STL file. Data transmitted to the server will serve purely for the generation of your STL file and will be vanished immediately after.<br>

            <p>© 2023 Flui3d Team @ Technical University of Munich | <a href="https://www.ce.cit.tum.de/eda/datenschutz/">Datenschutz</a> | <a href="https://www.ce.cit.tum.de/eda/impressum/">Impressum</a></p>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>