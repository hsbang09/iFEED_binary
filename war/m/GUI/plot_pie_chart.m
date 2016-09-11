function plot_pie_chart(hFigure,sat_id)
global zeResult;

    % Mass budgets
    n = 1;
    facts = zeResult.getCost_facts( );
    data(n:n+12,1) = {'Payload','EPS','ADCS','Thermal','Comm+Avionics', ...
                      'Propulsion (AKM)','Structure','Propellant injection', ...
                      'Propellant ADCS+deorbit','dry mass','wet mass','adapter','launch mass'}';
    [~,tmp2] = get_facts_values( facts, {'Name', 'payload-mass#', 'EPS-mass#','ADCS-mass#',...
                                    'thermal-mass#','avionics-mass#','propulsion-mass#','structure-mass#',...
                                    'propellant-mass-injection','propellant-mass-ADCS',...
                                    'satellite-dry-mass','satellite-wet-mass','adapter-mass', ...
                                    'satellite-launch-mass'} );
    tmp2(1,:) = [];
    tmp2 = cell2mat(tmp2);
    pie(tmp2(1:7,sat_id),data(1:7,1),'Parent',hFigure);
end