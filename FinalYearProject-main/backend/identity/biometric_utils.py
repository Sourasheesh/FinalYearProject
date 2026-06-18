import cv2
import numpy as np
from PIL import Image


# =========================
# FINGERPRINT UTILITIES
# =========================

def preprocess_fingerprint(image_file):
    """
    Convert fingerprint to normalized grayscale image
    """

    image = Image.open(image_file).convert("L")
    image = np.array(image)

    image = cv2.resize(image, (256, 256))

    image = cv2.GaussianBlur(image, (5, 5), 0)

    return image


def extract_fingerprint_template(image_file):
    """
    Extract ORB fingerprint features
    """

    image = preprocess_fingerprint(image_file)

    orb = cv2.ORB_create(nfeatures=500)

    keypoints, descriptors = orb.detectAndCompute(image, None)

    if descriptors is None:
        return None

    return descriptors


def match_fingerprint_templates(template1, template2):

    if template1 is None or template2 is None:
        return False

    if template1.dtype != template2.dtype:
        template2 = template2.astype(template1.dtype)

    matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    matches = matcher.match(template1, template2)

    score = len(matches)

    return score > 20

# =========================
# IRIS UTILITIES
# =========================

def preprocess_iris(image_file):
    """
    Normalize iris image
    """

    image = Image.open(image_file).convert("L")
    image = np.array(image)

    image = cv2.resize(image, (256, 256))

    image = cv2.equalizeHist(image)

    return image


def extract_iris_template(image_file):
    """
    Extract iris features using ORB
    """

    image = preprocess_iris(image_file)

    orb = cv2.ORB_create(nfeatures=500)

    keypoints, descriptors = orb.detectAndCompute(image, None)

    if descriptors is None:
        return None

    return descriptors


def match_iris_templates(template1, template2):
    """
    Match iris templates
    """

    if template1 is None or template2 is None:
        return False

    matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    matches = matcher.match(template1, template2)

    score = len(matches)

    return score > 15