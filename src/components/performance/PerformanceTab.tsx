
  const renderChartContent = () => {
    if (activePerformanceTab === 'selectMetrics') {
      const availableMetrics = [
        { id: 'Revenue', label: 'Revenue' },
        { id: 'GrossMargin', label: 'Gross Margin' },
        { id: 'Customers', label: 'Customers' },
        { id: 'CAC', label: 'Customer Acquisition Cost' },
        { id: 'Runway', label: 'Runway' }
      ];
      
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {availableMetrics.map(metric => (
              <button
                key={metric.id}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedMetrics.includes(metric.id)
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground'
                }`}
                onClick={() => {
                  if (selectedMetrics.includes(metric.id)) {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                  } else {
                    setSelectedMetrics([...selectedMetrics, metric.id]);
                  }
                }}
              >
                {metric.label}
              </button>
            ))}
          </div>
          
          {selectedMetrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  type="category"
                  allowDuplicatedCategory={false}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {isMetricDataArray(chartData) && 
                  chartData
                    .filter(metric => selectedMetrics.includes(metric.name))
                    .map((metric, index) => (
                      <Line 
                        key={metric.id}
                        data={metric.data} 
                        dataKey="value" 
                        name={metric.name}
                        stroke={index === 0 ? "#8884d8" : "#82ca9d"}
                      />
                    ))
                }
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-muted-foreground">Select metrics to display</p>
          )}
        </div>
      );
    } else {
      // For monthly, 2025, and both tabs
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
            <Line type="monotone" dataKey="margin" stroke="#82ca9d" name="Margin %" />
            <Line type="monotone" dataKey="customers" stroke="#ffc658" name="Customers" />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Performance</h2>
        
        <div className="flex border rounded-md overflow-hidden mb-6">
          {['selectMetrics', 'monthly', '2025', 'both'].map((tab) => {
            const isActive = tab === activePerformanceTab;
            const label = tab === 'selectMetrics' 
              ? 'Select Metrics' 
              : tab === 'monthly' 
                ? 'Monthly' 
                : tab === 'both' 
                  ? 'Both' 
                  : tab;
                  
            return (
              <button
                key={tab}
                className={`py-2 px-4 ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-muted-foreground hover:bg-muted/50'
                }`}
                onClick={() => setActivePerformanceTab(tab)}
              >
                {label}
              </button>
            );
          })}
        </div>
        
        <Card className="mb-6 p-4">
          {renderChartContent()}
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">History</h2>
        
        <Card>
          <div className="mb-4 p-4">
            <p className="font-medium">Last Updated</p>
            <p className="text-muted-foreground">
              {performanceHistory && performanceHistory.length > 0 
                ? performanceHistory[0].updatedOn
                : new Date().toLocaleDateString()}
            </p>
          </div>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading history data...</p>
            </div>
          ) : (
            <DataTable
              columns={[
                { 
                  key: 'monthYear', 
                  header: 'Month - Year', 
                  render: (_, row: PerformanceHistoryItem) => `${getMonthName(row.month)} - ${row.year}` 
                },
                { key: 'createdOn', header: 'Created On' },
                { key: 'updatedOn', header: 'Updated On' },
                { 
                  key: 'status', 
                  header: 'Status',
                  render: (value) => (
                    <span className={value ? "text-green-600" : "text-destructive"}>
                      {value ? <Check size={18} /> : <X size={18} />}
                    </span>
                  ) 
                },
                { 
                  key: 'view', 
                  header: 'View',
                  render: (_, row: PerformanceHistoryItem) => (
                    <button 
                      className="text-primary hover:text-primary/80"
                      onClick={() => handleViewDetails(row.id)}
                    >
                      <Eye size={18} />
                    </button>
                  ) 
                },
              ]}
              data={performanceHistory || []}
              emptyState="No history data available"
            />
          )}
        </Card>
      </div>
    </div>
  );
}
