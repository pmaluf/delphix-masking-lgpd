


              echo "Creating metadata for table:\n"
			  TABLES=("tab1" "tab2" "tab3" "tab4" "tab5" "tab6" "tab7" "tab8" "tab9" "tab10")
              echo ${TABLES[@]}
              COUNT=$1
              for TABLE in ${TABLES}
              do
                echo "* ${COUNT} ${TABLE}"
                if [ ${COUNT} -lt 1000 ]
                 then
				   echo "less than 1000"
                elif [ ${COUNT} -ge 1000 -a ${COUNT} -lt 2000 ]
                  then
				   echo "Grater than 1000 an less than 2000"
                elif [ ${COUNT} -ge 2000 -a ${COUNT} -lt 3000 ]
                  then
				   echo "Grater than 2000 an less than 3000"
                elif [ ${COUNT} -ge 3000 -a ${COUNT} -lt 4000 ]
                  then
				   echo "Grater than 3000 an less than 4000"
                elif [ ${COUNT} -ge 4000 ]
                  then
				   echo "Grater than 4000"
                fi
                let "COUNT++"
                echo ${COUNT}
              done
