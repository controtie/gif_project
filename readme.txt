This project can be run locally, and found at: http://ec2-52-89-223-5.us-west-2.compute.amazonaws.com/gif_project/

NASA launched LandSat 8 in 2013 to monitor earth by periodically taking pictures from space. These pictures are available for developers through
NASA's Open API initiative found here: https://open.nasa.gov/
This project asks for a set of images at coordinates between two dates and turns them into a gif using an library called gifshot. 
It's meant to be kind of like a time lapse of any large scale event/construction/natural disaster on earth. 

How to Use:
1. To run the program, open index.html in a browser or visit http://ec2-52-89-223-5.us-west-2.compute.amazonaws.com/gif_project/
2. The first two fields specify the start and end dates which gif_project will ask for from NASA. They must be in this format: YYYY-MM-DD. For 
example, for pictures from February 20th 2015 to June 6th 2015, type 2015-02-20, 2015-06-06 in the first and second fields.  
3. The second two fields specify the latitiude and longitude at which gif_project will ask NASA for pictures. These should be in their decimal form.
For example, the Tesla gigafactory is located at 39Â°31'48.0"N, 119Â°26'20.4"W. This would be 39.537975 and -119.439096 respectively.

*The program uses an API key which has a 100-200 request limit per hour on a rolling basis. If the API limit is reached, wait a while
and try again.
