set hea on
set pages 0
set lin 420
set trimspool on
set feedback off
spool desc_tables.txt
select t.TABLE_NAME || '|' || 
       s.COLUMN_NAME || '|' ||
       s.DATA_TYPE || '|' ||
	   s.DATA_LENGTH || '|' ||
	   s.DATA_PRECISION || '|' ||
	   t.NUM_ROWS 
from DBA_TABLES t,DBA_TAB_COLUMNS s
where t.table_name = s.table_name
and   t.OWNER  = '&schema';
spool off

spool desc_cons_columns.txt
select t.TABLE_NAME || '|' || 
       t.CONSTRAINT_NAME || '|' || 
	   t.COLUMN_NAME 
from DBA_CONS_COLUMNS t
where t.OWNER = '&schema';
spool off


spool cons_details.txt
select t.TABLE_NAME || '|' ||  
       t.CONSTRAINT_NAME || '|' || 
	   t.CONSTRAINT_TYPE || '|' ||  
	   t.INDEX_OWNER || '|' ||  
	   t.INDEX_NAME
from DBA_CONSTRAINTS t
where t.OWNER  = '&schema';
spool off

spool desc_index.txt
select t.INDEX_NAME || '|' ||  
       t.INDEX_TYPE || '|' ||   
	   t.TABLE_NAME || '|' ||   
	   t.VISIBILITY || '|' || 
       t.UNIQUENESS || '|' ||	   
	   t.STATUS
from DBA_INDEXES t
where t.OWNER = '&schema';
spool off

spool desc_triggers.txt
select t.OWNER || '|' ||  
       t.TRIGGER_NAME || '|' ||         
	   t.TABLE_NAME || '|' ||  
	   t.TRIGGER_TYPE || '|' ||  
	   t.COLUMN_NAME || '|' ||  
	   t.STATUS 
from DBA_TRIGGERS;
spool off

spool desc_jobs.txt
select t.JOB || '|' ||   
       t.PRIV_USER || '|' ||  
	   t.SCHEMA_USER || '|' ||   
	   t.BROKEN || '|' ||  
	   t.FAILURES 
from DBA_JOBS t;
spool off

spool desc_jobs_scheduler.txt
select t.OWNER || '|' ||   
       t.JOB_NAME || '|' ||   
       t.JOB_SUBNAME || '|' ||   
       t.JOB_STYLE || '|' ||   
       t.JOB_CREATOR || '|' ||   
       t.PROGRAM_OWNER || '|' ||   
       t.PROGRAM_NAME || '|' ||   
       t.JOB_TYPE || '|' ||   
       t.SCHEDULE_OWNER || '|' ||   
       t.SCHEDULE_NAME || '|' ||                          
       t.SCHEDULE_TYPE || '|' ||                           
       t.ENABLED || '|' ||   
	   t.CREDENTIAL_OWNER || '|' ||   
       t.CREDENTIAL_NAME
from dba_scheduler_jobs t;
spool off

exit
 
