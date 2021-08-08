# Mapplets for Delphix Masking

The files in this folder, are custom mapplets that are unsupported by Delphix. Use at your own discretion.

## Install Instructions

Upload the algorithm to the Delphix Masking Engine (version **v5.3.1.0** or above). From the Settings>Custom Algorithms screen, click on "Add Algorithm" select the mapplet .xml file, and insert the values below:

- inputValue for Input
- outputValue for Output

Click on "Submit";
Then you'll need to create a "Domain" pointing to that algorithm;

### CPF/CNPJ Algorithm

- Maintains referential integrity, even between different database platforms (e.g. Oracle, MSSQL, etc);
- Keeps the original format, if it had a format of (XXX.XXX.XXX-XX) or (XX.XXX.XXX<span></span>/<span></span>XXXX-XX) it is kept in the new value, otherwise, the new value will be numeric only;
- When it finds a valid CPF with a number equal to or less than 11 (with zeros to the left) the algorithm creates a valid CPF;
- When it finds a valid CNPJ with a number equal to or less than 14 (with leading zeros) the algorithm creates a valid CNPJ, keeping the company branch number (XX.XXX.XXX<span></span>/ <span></span>**0001**-XX);
- When it finds a blacklisted or invalid number (ex.: 0, or 11111111111) the algorithm returns the same number as the source;
- In internal tests we achieved a performance over 300,000 masked records per minute, we estimate that high performance environments can achieve a performance over 900,000 masked records per minute;
