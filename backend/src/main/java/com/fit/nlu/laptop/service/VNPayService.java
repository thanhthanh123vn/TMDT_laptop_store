package com.fit.nlu.laptop.service;

import java.util.Map;

public interface VNPayService {

    boolean verifySignature(Map<String, String> queryParams);


    void updateOrderStatus(String vnp_TxnRef, String status);
}