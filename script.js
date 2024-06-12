document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart').getContext('2d');
    let myChart;

    function toUTCString(localDateTime) {
        const date = new Date(localDateTime);
        return date.toISOString().split('.')[0] + 'Z';
    }

    function fetchData() {
        const startDateLocal = document.getElementById('startDate').value;
        const endDateLocal = document.getElementById('endDate').value;

        if (!startDateLocal || !endDateLocal) {
            alert('Please select both start and end dates.');
            return;
        }

        const startDateUTC = toUTCString(startDateLocal);
        const endDateUTC = toUTCString(endDateLocal);
        const apiUrl = `https://7kby0ecabc.execute-api.us-west-1.amazonaws.com/Stage/getData/?plantId=0&startTime=${startDateUTC}&endTime=${endDateUTC}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const labels = data.map(item => new Date(item.timestamp + "Z").toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
                const moistureData = data.map(item => item.moisture);
                const lightData = data.map(item => item.light);

                if (myChart) {
                    myChart.destroy();
                }

                myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Moisture Level',
                                data: moistureData,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                yAxisID: 'y-axis-1',
                            },
                            {
                                label: 'Light Level',
                                data: lightData,
                                borderColor: 'rgba(153, 102, 255, 1)',
                                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                yAxisID: 'y-axis-1',
                            }
                        ]
                    },
                    options: {
                        scales: {
                            yAxes: [
                                {
                                    id: 'y-axis-1',
                                    type: 'linear',
                                    position: 'left',
                                    ticks: {
                                        beginAtZero: true,
                                        min: 0,
                                        max: 100
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Level (%)'
                                    }
                                }
                            ],
                            xAxes: [
                                {
                                    type: 'time',
                                    time: {
                                        unit: 'minute',
                                        tooltipFormat: 'll HH:mm'
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Time'
                                    }
                                }
                            ]
                        }
                    }
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function updateThresholdValue(value) {
        document.getElementById('thresholdValue').textContent = value;
    }

    function updateWateringThreshold() {
        const thresholdValue = document.getElementById('wateringThreshold').value;

        fetch('https://7kby0ecabc.execute-api.us-west-1.amazonaws.com/Stage/config/?action=put', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                plant_id: "0",
                watering_threshold: parseInt(thresholdValue),
                water_alert_threshold: 40
            })
        })
        .then(response => response.json())
        .then(data => {
            alert('Threshold updated successfully!');
        })
        .catch(error => console.error('Error updating threshold:', error));
    }

    window.updateThresholdValue = updateThresholdValue;
    window.updateWateringThreshold = updateWateringThreshold;
    window.fetchData = fetchData;
});
