# MC Demo Controller
REST server that helps you send messages through Marketing Cloud for your demo purpose. 

With this you can just send a HTTP GET request to:
```
http://[your_url_here]/api/v1/demo/flow/run/[your_demo_name_here]
```

And it will send you SMS, Email, Push or combination of those.

You can also configure sequential messages, so that the the next HTTP GET call you make will send you the second message you want to be sent in your demo.


# Configuring
Configuring this requires you to send a JSON data to the app.

And here is sample config format for your reference.
```json
{
    "name": "[your_demo_name]",
    "config": {
        "clientId": "[your_API_clientId]",
        "clientSecret": "[your_API_clientSecret]",
        "apiURL": "[your_API_REST_URL]",
        "authURL": "[your_API_AUTH_URL]"
    },
    "states": [
        {
            "send": [
                {
                    "channel": "push",
                    "templateId": "[your_push_template_id]",
                    "listId": "[mobile_list_id_to_send_to]"
                },
                {
                    "channel": "sms",
                    "templateId": "[your_sms_template_id]",
                    "mobileNumbers": ["[your_phone_number]"],
                    "messageTextOverride": "This message override is optional. With this you can override the message text in your SMS template."
                }
            ]
        },
        {
            "send": [
                {
                    "channel": "email",
                    "triggeredEmailExternalKey": "[your_triggered_email_external_key]",
                    "email": "[your_email_address]",
                    "customerKey": "[customer_key_or_can_use_the_same_email_address_as_above]",
                    "attributes": {
                        "First_Name": "[any_attribute_to_override_in_your_template]",
                        "Last_Name": "[any_attribute_to_override_in_your_template]"
                    }
                }
            ]
        }
    ]
}
```

JSON attribute `states` array is where you configure the sequence.

Notice also JSON attribute `send` inside `states` is also an array, which means you can send multiple messages in one go.

## Creating Demo Config
To send the config to the app, you need to send a HTTP POST request to:
```
http://[your_url_here]/api/v1/demo/
```
with the config as the body. Don't forget to set header to include `Content-Type: application/json` in the HTTP headers.

## Updating Demo Config
If you want to modify your existing config you can send a HTTP POST request to:
```
http://[your_url_here]/api/v1/demo/[your_demo_name]
```
with the config as the body, same as when you are creating new one.

## Deleting Demo Config
If you want to delete your existing config you can send a HTTP DEL request to:
```
http://[your_url_here]/api/v1/demo/[your_demo_name]
```

## Execute Demo
To run the demo and sending messages as per configured, you can send a HTTP GET request to:
```
http://[your_url_here]/api/v1/demo/flow/run/[your_demo_name]
```

## Reset Demo State
You can also reset the demo state / sequence to 0 by sending HTTP GET request to:
```
http://[your_url_here]/api/v1/demo/flow/reset/[your_demo_name]
```


# Working with Flic Button
To work with your Flic button, you can configure:
- Click: send HTTP request to run your demo 
- Hold: send HTTP request to reset the state


# Not Currently Supported
- API v2


# Roadmap
- User Interface for configuring the demo config
