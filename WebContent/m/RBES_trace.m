function RBES_trace(fact)
jess(['defrule SYNERGIES::tmp_trace_fact '...
    '( ' fact ' )' ...
    ' => ' ...
    ' (printout t "' fact '" found crlf )']);
end
  