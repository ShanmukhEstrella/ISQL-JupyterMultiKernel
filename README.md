### DESCRIPTION
- ISQL - Jupyter Kernel for SQL


### FEATURES
- Users can query data using ISQL Kernel by using SQL in jupyter notebooks.
- It is Python implementation of SQL REPL.
- Users can run their local SQL server in kernel.
- Integrated IPython Kernel features into ISQL Kernel, giving capability to users to switch between languages in the same notebook session.
- Query results from sql notebook cells will be availble as pandas dataframes in subsequent python cells to continue further data analysis.
- Syntax highlighting and auto-completion are availabe for both python and sql code within notebooks. Both light and dark theme are supported.


### REQUIREMENTS
- JupyterLab >= 4.0.0


### USER INSTALLATION
For ISQL-Kernel to install in your virtual environment, follow the steps:
- Activate your virtual environment
- ```
  pip install isql-kernel
  python -m isql_kernel.install
  ```
For KernelSwitch-UI lab extenstion to install, follow the steps:
- ```
  pip install isql-cell-ui
  jupyter lab build
  ```
For SQL-SyntaxHighlighting lab extenstion to install, follow the steps:
- ```
  pip install isql-syntax-coloring
  jupyter lab build
  ```


To uninstall ISQL Kernel:
- ```
  pip uninstall isql-kernel
  jupyter kernelspec remove isql-kernel
  ```



  
Now you can see the features below!!
You can start using the ISQL Kernel now!!


### HOME INTERFACE
<img width="1182" height="590" alt="image" src="https://github.com/user-attachments/assets/7989ece5-10c4-4681-8e2c-5add28875e7d" />


### NOTEBOOK INTERFACE
<img width="1429" height="543" alt="image" src="https://github.com/user-attachments/assets/9e0d9cff-f5fe-4071-a993-5c31f92176bf" />




