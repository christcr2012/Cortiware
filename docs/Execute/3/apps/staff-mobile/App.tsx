import React from 'react'; import { View, Text, Button } from 'react-native';
import { withinRadius } from '../../shared/geo';
export default function App(){
  const site={lat:40.5853,lon:-105.0844,radius:200};
  return <View style={{padding:16}}>
    <Text style={{fontSize:18, fontWeight:'600'}}>Staff · Cleaning</Text>
    <Button title="Clock In (geofence stub)" onPress={()=>{
      const ok = withinRadius(40.585, -105.084, site);
      alert(ok? 'Clock-in OK':'Outside geofence (selfie override)');
    }}/>
    <Button title="Checklist (stub)" onPress={()=>alert('Checklist submitted')}/>
  </View>;
}
