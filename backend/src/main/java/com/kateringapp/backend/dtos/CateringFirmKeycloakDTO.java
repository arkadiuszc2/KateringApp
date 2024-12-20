package com.kateringapp.backend.dtos;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class CateringFirmKeycloakDTO {

    String address;

    Integer phoneNumber;

    String email;
}
