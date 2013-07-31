Proof-of-concept, in-browser, multiplayer, top-down racing game made using Node.js, Socket.io, and Hammer.js. Point a browser on one computer (preferably connected to a big screen) to /display.html. Then each player visits the server on their phone and sees a steering wheel that allows them t
o control the new car made for them on the screen page.

__more details__: http://www.hackniac.com/posts/derby.html

INSTALL / RUN
-------

1. git clone https://github.com/jmptable/derby.git
2. cd derby
3. npm install
4. node derby.js # may need to run as root to use port 80
5. visit localhost/display.html in browser on computer running server
6. visit IP of server in browser on another device to play
