import random
import sys
import cv2
import numpy as np

filename = sys.argv[1]
#filename = ''
img = cv2.imread("./Image/" + filename,
                 cv2.IMREAD_GRAYSCALE)


new_filename = "save" + str(random.randint(1, 21)*5) + ".jpg"
filepath = "./Image/" + new_filename
cv2.imwrite(filepath, img)

print(new_filename)
# print('save105.jpg')
