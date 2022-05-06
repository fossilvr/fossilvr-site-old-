
# FossilVR 

### A virtual reality platform to help third grade students with literacy and science skills

<em> ***Web based prototype*** - www.fossilvr.github.io</em>


## Introduction:

FossilVR is an immersive learning experience aimed towards elementary school students to inculcate inferential and investigative skills in them besides providing the requisite scientific knowledge about the field of paleontology. The web based prototype includes a virtual environment of an archaeological site where students must locate and make observations about certain fossils with the help of their trusty paleontologist friend, Dr. Hannah. The environment serves as an  open world for the students to explore and search for fossils while being guided along the way by Dr. Hannah. Once the student locates a fossil, they can send it back to the fossil station. The fossil station is a location in the playable area where all the fossils found by a student are stored and kept on display. The students can then note down their observations in an interactive journal by marking certain points of interest on a fossil and then making their observations and inferences while referring to that particular spot. This platform also strives to be open for future development aimed towards collaboration among students. The following notes briefly go over various aspects included in the current prototype along with recommendations for future work. The entirety of this project was built using Babylon.js.

## Instructions:

The player interacts with the world through a first person view. 
The arrow keys are binded to make the player move in the required direction.
The W, A, S and D keys are binded to make the player move in the forward, left, right and backward directions respectively.
The player can look around by pressing the left mouse button and dragging it in the required direction.
The player can interact with objects in the scene by placing the mouse pointer over it and pressing the ‘E’ key.
The player can replay Dr. Hannah’s dialogue by pressing the ‘F’ key.
The players can select various buttons in the GUI using the left mouse button.
The players can rotate an object that has been picked along the x, y or z axis by pressing the ‘X’, ‘Y’ or the ‘Z’ key respectively.





## Walkthrough:

### Main menu

The main menu features a backdrop with a desert-like aesthetic to it along with the title of the project. A mute/unmute button is present at the top left corner in case the user wishes to mute/unmute the game at any point of time. The GUI features a start button to begin the experience. An ambient sound of the desert loops throughout the experience in the background.

!["Start Screen"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen1.PNG)


### The World

!["The World"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen2.PNG)

The virtual environment features an interactive world which the player can navigate through. At the center of this world is the paleontologist Dr. Hannah’s tent. Adjacent to it is our fossil station where the fossils discovered by the player will be kept and displayed. There are currently 3 fossils scattered across the map and the objective of the player is to locate these fossils. Rocky mountains have been placed across the border of the map to indicate its edges along with invisible walls across the same to prevent map fall off. The player’s are free to move around this world.

!["The World"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen10.PNG)
!["The World"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen5.PNG)
!["The World"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen6.PNG)



Dr. Hannah’s dialogues begin when the player gets close enough to her. She explains the idea of observations and inferences to the player and also gives an example of a chameleon to further elaborate on the idea of observations and inferences. The player can choose to skip over the audio by pressing the next button or can skip over the entire dialogue by pressing the cancel button. If the player would like to replay the dialogue, they can approach Dr. Hannah and press the ‘F’ key.

!["Hannah"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen3.PNG)
!["Hannah"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen4.PNG)

Once a player locates a fossil placed near a flag in the world, they can begin digging it out from underneath the rocks. The player can pick these rocks by pointing at them with the cursor and then pressing the ‘E’ key. The mechanism involves raycasting from the cursor into the screen and checking whether the mesh can be picked up or whether it is a fossil. Iif the player is within 5 meters of the correct mesh, then the mesh can be interacted with using the raycast. They can also rotate the rocks by pressing the ‘X’, ‘Y’, and ‘Z’ keys to rotate the picked mesh about their x, y and z axis respectively. Once picked, the rocks attach themselves to the center of the screen and move along with the player. They can be dropped by pressing the ‘E’ key again.

!["Located Fossil"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen7.PNG)

On locating the fossil, the player can then press the ‘E’ key to interact with it. A new information panel opens up stating the kind of fossil found, the location of the find and the person it was found by. A button appears in the panel prompting the user to send the fossil back to the fossil station. Upon clicking the button, the panel is closed and the fossil is sent to the fossil station and is displayed in its appropriate shelf. All interactions with the world during the presence of this information panel cease. There are 3 fossils in the current version scattered across the map. They are the triceratops fossil, ammonite fossil and the tyrannosaurus rex fossil which the player must locate.

## GUI elements:

Three buttons have been provided on the right hand side of the screen. The first button pops up a hint panel which displays the control scheme to the user. The second button opens up the fossil journal and the third button displays a 2D map of the world from a birds eye view.

!["Hint"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen8.PNG)
!["Map"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/screen9.PNG)


## Journal:

The fossil journal is a section of the experience where the students can make observations and inferences about the fossils that they have found. The journal displays a 3D model of the fossil which the user can interact with along with an area to note down observations and inferences. The user can double click on an area of concern in the fossil to put down a colored pin at that point. An input field opens up in the note taking area with its color key mapped to the color of the dropped pin. The student can then note down their observations and inferences for that particular point where the pin has been set. Incorrectly dropped pins can be removed clicking the right mouse button while the cursor is on that particular pin. Once the user is done making their observations, they can select the ‘Done’ button in the GUI to go back to the world and continue looking for fossils. The user can also navigate through the other fossils that they have discovered using the up and down arrow keys. Observations and inferences have been stored in the JSON format to be used in the future for persistence and import/export purposes. The user can also visit the fossil station and press the ‘E’ key on a particular fossil to load the journal with the appropriate fossil being displayed.

!["Journal"](https://github.com/fossilvr/fossilvr.github.io/blob/master/screenshots/Screen11.PNG)



## Miscellaneous Components:

Player: Our player is an invisible box that can be controlled with the appropriate keys with a camera mounted on top of it. The user can drag the cursor across the screen to look around.

Skybox: A skybox has been applied to the environment to replicate the look of a natural sky.

Image Based Lighting: IBL has been used to provide a more real to life lighting around the environment by using PBR materials for different assets.

Physics Controller: The cannon.js library was used to control all the physics in the scene. The rocks and the fossil’s have a physicsImposter controller attached to it making them susceptible to gravitational forces.

Invisible walls: Invisible planes have been placed along the edges of the world with collisions enabled to prevent the player from falling off the map.

Custom Cursor: A custom svg cursor has been used for the experience to add to its aesthetics.
Map: A minimap is available to the user to be viewed at all times. The map has been created by placing a 2nd camera above the scene looking down at it from a bird’s eye view and then rendering what it sees onto a textured plane using a shader to pixelate the map.

Shadows: All objects in the scene cast a shadow on the ground which was created using a ShadowGenerator component.

### Future Work:
<ol>
<li>The playable experience could be expanded upon with more fossils and multiple environments.</li>
<li>Dr. Hannah’s dialogue must be re-recorded for the newer journal.</li>
<li>Develop a backend to allow for collaboration among students.</li>
<li>The collaborative environment would allow students to see each other’s observations and inferences.</li>
<li>Export the JSON data of the observations and inferences of a student in a format suitable for grading by the teachers.</li>
<li>Provide support for mobile devices.</li>
<li>Provide support for WebXR.</li>
  <li>Look into better on screen instructions/tutorial level.</li>

  

