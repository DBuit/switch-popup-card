# Switch popup card (homekit style)


Example configuration
```
entity: light.beganegrond
popup:
    type: custom:switch-popup-card
    icon: "mdi-lightbulb"
    noActiveState: '-'
    entity_value_path: attributes.brightness
    service: light.turn_on
    service_data:
    entity_id: this
    brightness: value
    entities:
    - light.beganegrond
    buttons:
    - icon: "mdi:lightbulb-on"
        value: 255
        name: "100%"
        color: "#FFF"
        icon_color: "rgba(255,255,255,1)"
    - icon: "mdi:lightbulb-on"
        value: 204
        name: "80%"
        color: "#FFF"
        icon_color: "rgba(255,255,255,0.8)"
    - icon: "mdi:lightbulb-on"
        value: 153
        name: "60%"
        color: "#FFF"
        icon_color: "rgba(255,255,255,0.6)"
    - icon: "mdi:lightbulb-on"
        value: 102
        name: "40%"
        color: "#FFF"
        icon_color: "rgba(255,255,255,0.4)"
    - icon: "mdi:lightbulb-on"
        value: 51
        name: "20%"
        color: "#FFF"
        icon_color: "rgba(255,255,255,0.2)"
```

![screenshot](screenshot.png "screenshot")
