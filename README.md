# DiamondHands

DiamondHands: A BackTesting Applicaiton

# How to setup ?

## Step 1: Install Python (Skip if you have Python already installed)

### On Windows:

1. Download the Python installer from the [official Python website](https://www.python.org/downloads/).
2. Run the installer and make sure to check the box that says "Add Python 3.11 to PATH" before you click "Install Now".

### On Linux/Mac:

Use a package manager like `apt` for Ubuntu or `brew` for MacOS:

```bash
# Ubuntu
sudo apt update
sudo apt install python3.11

# MacOS
brew install python@3.11
 
```

After installing Python 3.11 on you system
Open your terminal and follow the below steps.

## Step 2: Clone the GitHub Repository

```
git clone https://github.com/hersh29/diamond-hands.git
```

It will clone the project to your computer in `diamond-hands` folder.

## Step 3: Navigate to the Project Directory

```
cd diamond-hands
```

It will change the working directory to the application directory.

## Step 4: Create a Virtual Environment(Optional)

```
python3 -m venv myenv
```

It will create a python virtual environment.
After this operation, you will see the new folder called `myenv`

If you are on Mac/linux, run this command to activate the virtual environment.

```
source myenv/bin/activate
```

Or if you are on Windows, run this command to activate the virtual environment.

```
myenv\Scripts\activate
``` 

## Step 5: Install the Project Dependencies

```
pip install -r requirements.txt
```

It will install all the project libraries.

## Step 7: Run the Django Server

```
python manage.py runserver
```

You should see output indicating that the server is running, along with the address at which you can access it (http://127.0.0.1:8000/).

