const renderTable = () => {

        console.log("** renderTable");
        
        const groupColumnYear = 0
        const groupColumnGeo = 1;
        const groupId = 0;
        let filteredTableData;

        const filteredTableYearData = 
            fullDataTableObjects
            .filter(d => selectedSummaryYears.includes(d.Time))

        // get geoTypes available for this year

        const dataGeos = [...new Set(filteredTableYearData.map(d => d.GeoType))];

        // console.log("dataGeos", dataGeos);

        // get all geo check boxes

        const allGeoChecks = document.querySelectorAll('.checkbox-geo');

        // console.log("allGeoChecks", allGeoChecks);

        let geosNotAvailable = [];
        
        // remove disabled class from every geo list element

        $(allGeoChecks).removeClass("disabled");
        $(allGeoChecks).attr('aria-disabled', false);
        
        // add disabled class for geos not available for this year
        for (const checkbox of allGeoChecks) {

            // console.log("checkbox", checkbox.children[0].value);

            if (!dataGeos.includes(checkbox.children[0].value)) {
                
                geosNotAvailable.push(checkbox)
                
                // set this element as disabled
                $(checkbox).addClass("disabled");
                $(checkbox).attr('aria-disabled', true);
                
            }

        }

        // console.log("geosNotAvailable", geosNotAvailable);

        // only render table if a geography is checked

        if (selectedSummaryGeography.length > 0) {
            
            filteredTableData = 
                filteredTableYearData
                .filter(d => selectedSummaryGeography.includes(d.GeoType))

        } else {
            
            // if no selected geo, then set table to blank and return early
            document.querySelector("#tableID").innerHTML = '';

            return;
        }
        
        // console.log("filteredTableData", filteredTableData);

        if (filteredTableData.length === 0) {

            // if no selected geos not in data, then set table to blank and return early
            document.querySelector("#tableID").innerHTML = '';
            
            return;

        }
        
        // console.log("filteredTableData [renderTable]", filteredTableData);
        
        const measureAlignMap = new Map();
        // const measureImputeMap = new Map();
        const measures = [...new Set(filteredTableData.map(d => d.MeasurementDisplay))];
        
        measures.forEach((m) => {
            
            measureAlignMap.set(m, "r")
            // measureImputeMap.set(m, () => "-")
            
        });
        
        const measureAlignObj = Object.fromEntries(measureAlignMap);
        // const measureImputeObj = Object.fromEntries(measureImputeMap);
        
        // console.log("measureAlignObj", measureAlignObj);
        // console.log("measureImputeObj", measureImputeObj);
        
        const filteredTableAqData = aq.from(filteredTableData)
            .groupby("Time", "GeoType", "GeoID", "GeoRank", "Geography")
            .pivot("MeasurementDisplay", "DisplayCI")
        
            // need to put this down here because the data might be missing one of the measures, which will be undefined after the pivot
            // .impute(measureImputeObj) 
            
            // these 4 columns always exist, and we always want to hide them, so let's put them first, respecting the original relative order
            .relocate(["Time", "GeoType", "GeoID", "GeoRank"], { before: 0 }) 
        
        // console.log("filteredTableAqData [renderTable]");
        // filteredTableAqData.print({limit: 400})
        
        // export Arquero table to HTML
        
        document.getElementById('summary-table').innerHTML = 
            filteredTableAqData.toHTML({
                limit: Infinity,
                align: measureAlignObj, 
                null: () => "-" // use this to replace undefined
            });
        
        // this gives the table an ID (table code generated by Arquero)
        
        document.querySelector('#summary-table table').id = "tableID"
        
        // set some display properties 
        document.querySelector('#summary-table table').className = "cell-border stripe"
        document.querySelector('#summary-table table').width = "100%"
        
        // call function to show table
        
        $('#tableID').DataTable({
            scrollY: 500,
            scrollX: true,
            scrollCollapse: true,
            searching: false,
            paging: false,
            select: true,
            buttons: [
                {
                    extend: 'csvHtml5',
                    name: "thisView",
                    filename: 'NYC EH Data Portal - ' + indicatorName + " (filtered)"
                }
            ],
            bInfo: false,
            fixedHeader: true,
            orderFixed: [ 3, 'asc' ], // GeoRank
            columnDefs: [
                { targets: [0, 1, 2, 3], visible: false}
            ],
            "createdRow": function ( row, data, index ) {
                // console.log('RENDER TABLE FUNCTION - CreatedRow')
                const time    = data[0];
                const geoType = data[1];
                if (time && geoType) {
                    row.setAttribute(`data-group`, `${time}-${geoType}`)
                    row.setAttribute(`data-year`, `${time}`);
                }
            },
            "drawCallback": function ( settings ) {
                // console.log('RENDER TABLE FUNCTION - DrawCallback')
                const api = this.api();
                const data = api.rows( {page:'current'} ).data()
                const rows = api.rows( {page:'current'} ).nodes();
                const totaleColumnsCount = api.columns().count()
                const visibleColumnsCount =  totaleColumnsCount - 4;
                
                let last = null;
                let lastYr = null;
                
                const createGroupRow = (groupColumn, lvl) => {
                    
                    api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
                        
                        const year = data[i][0]
                        const groupName = `${year}-${group}`
                        
                        if ( last !== group || lastYr !== year ) {
                            
                            $(rows).eq( i ).before(
                                `<tr class="group"><td colspan="${visibleColumnsCount}" data-year="${year}" data-group="${group}" data-group-level="${lvl}"> ${group}</td></tr>`
                                );
                                last = group;
                                lastYr = year
                                
                            }
                        });
                    }
                    
                    createGroupRow(groupColumnYear, 0);
                    createGroupRow(groupColumnGeo, 1);
                    handleToggle();
                }
            })

        }