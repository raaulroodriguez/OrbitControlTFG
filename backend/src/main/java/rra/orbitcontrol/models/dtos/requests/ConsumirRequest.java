package rra.orbitcontrol.models.dtos.requests;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConsumirRequest {
    private Long heladoId;
    private int  cantidad;
}
