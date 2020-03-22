from setuptools import find_packages, setup

setup(
    name='corona_assistent_bot',
    version='0.0.0',
    url='https://github.com/LittleKita/CoronaAssistent',
    license='MIT',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    python_requires='>=2.7, !=3.0.*, !=3.1.*, !=3.2.*, !=3.3.*, !=3.4.*, !=3.5.*',
)
